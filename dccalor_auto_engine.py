"""
Motor Autônomo e Pipeline Integrado do DCCALOR
"""
import os
import sqlite3
import argparse
import numpy as np
import pandas as pd
from datetime import datetime
from dccalor.core.psicrometria import Psicrometria
from dccalor.core.fisica_termodinamica import MotorTermico
from dccalor.models.calibracao_bayesiana import CalibradorBayesiano
from dccalor.models.preditor_hibrido import PreditorHibrido
from dccalor.evaluation.auditoria_ashrae14 import auditar

class DCCALOREngine:
    def __init__(self, db_path: str = "dccalor_banco.db"):
        self.db_path = db_path
        self.psicro = Psicrometria()
        self.motor = MotorTermico()
        self.calibrador = CalibradorBayesiano()
        self.preditor = PreditorHibrido()

    def processar_e_enriquecer(self, df: pd.DataFrame, col_temp: str = "temperatura", col_umid: str = "umidade") -> pd.DataFrame:
        """Aplica psicrometria completa e variáveis dinâmicas."""
        df = df.copy()
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df = df.sort_values(by="timestamp").drop_duplicates(subset=["timestamp"]).set_index("timestamp")
        
        # Filtros de sanidade física
        df[col_temp] = df[col_temp].clip(lower=-10.0, upper=55.0)
        df[col_umid] = df[col_umid].clip(lower=2.0, upper=100.0)
        df = df.interpolate(method="time").ffill().bfill()

        # Psicrometria
        df["entalpia_kj_kg"] = self.psicro.entalpia_especifica(df[col_temp].values, df[col_umid].values)
        df["umidade_absoluta"] = self.psicro.umidade_absoluta(df[col_temp].values, df[col_umid].values)
        df["vpd_kpa"] = self.psicro.deficit_pressao_vapor(df[col_temp].values, df[col_umid].values)
        df["ponto_orvalho_c"] = self.psicro.ponto_orvalho(df[col_temp].values, df[col_umid].values)

        # Harmônicos sazonais
        hora = df.index.hour + df.index.minute / 60.0
        dia = df.index.dayofyear
        df["fourier_dia_sin"] = np.sin(2 * np.pi * hora / 24.0)
        df["fourier_dia_cos"] = np.cos(2 * np.pi * hora / 24.0)
        df["fourier_ano_sin"] = np.sin(2 * np.pi * dia / 365.25)
        df["fourier_ano_cos"] = np.cos(2 * np.pi * dia / 365.25)

        # Lags temporais
        for lag in [1, 2, 4]:
            df[f"temp_lag_{lag}"] = df[col_temp].shift(lag)
            df[f"entalpia_lag_{lag}"] = df["entalpia_kj_kg"].shift(lag)

        return df.dropna()

    def executar_treinamento_e_auditoria(self, df_entrada: pd.DataFrame):
        """Executa calibração física, treino híbrido e validação ASHRAE 14."""
        print("\n" + "="*60)
        print(" [DCCALOR] INICIANDO TREINAMENTO E AUDITORIA DO MODELO")
        print("="*60)
        
        df_proc = self.processar_e_enriquecer(df_entrada)
        split_idx = int(len(df_proc) * 0.8)
        df_train, df_test = df_proc.iloc[:split_idx], df_proc.iloc[split_idx:]

        print(f"[*] Registros totais: {len(df_proc)} | Treino: {len(df_train)} | Teste: {len(df_test)}")

        # 1. Calibração de Parâmetros Físicos
        res_calib = self.calibrador.calibrar(
            t_ext=df_train["temperatura"].values,
            t_int_real=df_train["temperatura"].values,
            q_ti_kw=np.full(len(df_train), 15.0)
        )
        print(f"\n[✓] Calibração Física Concluída:")
        print(f"    • U Calibrado: {res_calib['u_calibrado']:.3f} W/(m²·K)")
        print(f"    • C Efetiva:   {res_calib['c_efetiva']:.1f} kJ/K")
        print(f"    • RMSE Físico: {res_calib['rmse']:.3f} °C")

        # 2. Treinamento Híbrido Grey-Box
        features = [c for c in df_proc.columns if c not in ["temperatura", "ponto_orvalho_c"]]
        self.preditor.treinar(
            X=df_train[features],
            y_real=df_train["temperatura"],
            y_fisica=df_train["temp_lag_1"]
        )

        # 3. Predição e Auditoria ASHRAE 14 no Teste Cego
        y_pred_teste = self.preditor.prever(df_test[features], df_test["temp_lag_1"])
        metricas = auditar(df_test["temperatura"].values, y_pred_teste)

        print(f"\n[✓] Relatório Normativo ASHRAE Guideline 14:")
        print(f"    • CV(RMSE): {metricas['CV_RMSE_pct']}%  (Meta ASHRAE: < 15%)")
        print(f"    • NMBE:     {metricas['NMBE_pct']}%  (Meta ASHRAE: |NMBE| < 5%)")
        print(f"    • R²:       {metricas['R2']}      (Meta: > 0.92)")
        print(f"    • MAE:      {metricas['MAE']} °C")
        print(f"    • Status:   {metricas['Status']}")
        print("="*60 + "\n")
        return metricas

if __name__ == "__main__":
    print("[*] Testando motor DCCALOR com simulação de 1 ano de dados...")
    # Gera uma série temporal simulada de 1 ano para teste de integridade
    datas = pd.date_range("2025-09-03", "2026-08-20", freq="15min")
    temp_sim = 24.0 + 7.0 * np.sin(2 * np.pi * np.arange(len(datas)) / 96) + np.random.normal(0, 0.5, len(datas))
    umid_sim = 60.0 + 15.0 * np.cos(2 * np.pi * np.arange(len(datas)) / 96) + np.random.normal(0, 1.0, len(datas))
    
    df_teste = pd.DataFrame({
        "timestamp": datas,
        "temperatura": temp_sim,
        "umidade": umid_sim
    })

    engine = DCCALOREngine()
    engine.executar_treinamento_e_auditoria(df_teste)
