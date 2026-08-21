import os

files = {
    "dccalor/__init__.py": """\"\"\"Pacote DCCALOR - Gêmeo Digital Térmico Preditivo\"\"\"\n__version__ = \"2.0.0\"\n""",
    
    "dccalor/core/__init__.py": "",
    
    "dccalor/core/psicrometria.py": """import numpy as np

class Psicrometria:
    def __init__(self, pressao_atm_kpa: float = 101.325):
        self.p_atm = pressao_atm_kpa

    def pressao_saturacao(self, t_celsius):
        t = np.asarray(t_celsius, dtype=float)
        return 0.61078 * np.exp((17.27 * t) / (t + 237.3))

    def pressao_vapor_real(self, t_celsius, umid_rel_pct):
        p_ws = self.pressao_saturacao(t_celsius)
        rh = np.asarray(umid_rel_pct, dtype=float) / 100.0
        return rh * p_ws

    def umidade_absoluta(self, t_celsius, umid_rel_pct):
        p_v = self.pressao_vapor_real(t_celsius, umid_rel_pct)
        return 0.62198 * (p_v / np.maximum(self.p_atm - p_v, 1e-4))

    def entalpia_especifica(self, t_celsius, umid_rel_pct):
        t = np.asarray(t_celsius, dtype=float)
        w = self.umidade_absoluta(t_celsius, umid_rel_pct)
        return 1.006 * t + w * (2501.0 + 1.805 * t)

    def deficit_pressao_vapor(self, t_celsius, umid_rel_pct):
        return self.pressao_saturacao(t_celsius) - self.pressao_vapor_real(t_celsius, umid_rel_pct)

    def ponto_orvalho(self, t_celsius, umid_rel_pct):
        t = np.asarray(t_celsius, dtype=float)
        rh = np.maximum(np.asarray(umid_rel_pct, dtype=float) / 100.0, 1e-5)
        a, b = 17.27, 237.3
        alpha = ((a * t) / (b + t)) + np.log(rh)
        return (b * alpha) / (a - alpha)
""",

    "dccalor/core/fisica_termodinamica.py": """import numpy as np

class MotorTermico:
    def __init__(self, u_parede: float = 1.8, area_m2: float = 250.0, volume_m3: float = 600.0):
        self.u = u_parede
        self.area = area_m2
        self.volume = volume_m3
        self.rho = 1.204
        self.cp = 1.006

    def carga_conducao_kw(self, t_ext, t_int):
        return (self.u * self.area * (t_ext - t_int)) / 1000.0

    def carga_infiltracao_kw(self, t_ext, t_int, vazao_m3_s: float = 0.05):
        return self.rho * vazao_m3_s * self.cp * (t_ext - t_int)

    def carga_total_sensivel_kw(self, t_ext, t_int, q_ti_kw: float, vazao_m3_s: float = 0.05):
        return self.carga_conducao_kw(t_ext, t_int) + self.carga_infiltracao_kw(t_ext, t_int, vazao_m3_s) + q_ti_kw
""",

    "dccalor/data/__init__.py": "",
    
    "dccalor/data/database_manager.py": """import sqlite3
import pandas as pd
import os

class DatabaseManager:
    def __init__(self, db_path: str = "dccalor_banco.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(\"\"\"
                CREATE TABLE IF NOT EXISTS fato_telemetria (
                    timestamp TEXT PRIMARY KEY,
                    temperatura REAL,
                    umidade REAL,
                    entalpia_ar REAL,
                    vpd REAL,
                    temp_orvalho REAL
                )
            \"\"\")
            conn.execute(\"\"\"
                CREATE TABLE IF NOT EXISTS log_auditoria_ashrae (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    cv_rmse REAL,
                    nmbe REAL,
                    r2 REAL,
                    status TEXT
                )
            \"\"\")

    def salvar_dados(self, df: pd.DataFrame):
        with sqlite3.connect(self.db_path) as conn:
            df.to_sql("fato_telemetria", conn, if_exists="append", index=True)
""",

    "dccalor/models/__init__.py": "",
    
    "dccalor/models/calibracao_bayesiana.py": """import numpy as np
from scipy.optimize import minimize

class CalibradorBayesiano:
    def __init__(self, area_m2: float = 250.0, volume_m3: float = 600.0):
        self.area = area_m2
        self.volume = volume_m3
        self.c_ar = 1.204 * volume_m3 * 1.006

    def calibrar(self, t_ext, t_int_real, q_ti_kw, dt_seg: float = 900.0):
        def perda(p):
            u_val, c_efetiva = p
            c_tot = self.c_ar + c_efetiva
            t_pred = np.zeros(len(t_ext))
            t_pred[0] = t_int_real[0]
            for i in range(1, len(t_ext)):
                q_liq = (u_val * self.area * (t_ext[i-1] - t_pred[i-1])/1000.0) + q_ti_kw[i-1]
                t_pred[i] = t_pred[i-1] + (q_liq / c_tot) * dt_seg
            return np.sqrt(np.mean((t_int_real - t_pred)**2))

        res = minimize(perda, [1.8, 4000.0], bounds=[(0.1, 8.0), (100.0, 50000.0)], method="L-BFGS-B")
        return {"u_calibrado": float(res.x[0]), "c_efetiva": float(res.x[1]), "rmse": float(res.fun)}
""",

    "dccalor/models/preditor_hibrido.py": """import lightgbm as lgb
import pandas as pd
import numpy as np

class PreditorHibrido:
    def __init__(self):
        self.model = lgb.LGBMRegressor(n_estimators=250, learning_rate=0.03, num_leaves=31, verbose=-1, random_state=42)

    def treinar(self, X: pd.DataFrame, y_real: pd.Series, y_fisica: pd.Series):
        residuos = y_real - y_fisica
        self.model.fit(X, residuos)

    def prever(self, X: pd.DataFrame, y_fisica: pd.Series) -> np.ndarray:
        return y_fisica.values + self.model.predict(X)
""",

    "dccalor/evaluation/__init__.py": "",
    
    "dccalor/evaluation/auditoria_ashrae14.py": """import numpy as np
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

def auditar(y_real, y_pred, p: int = 4):
    n = len(y_real)
    y_mean = np.mean(y_real)
    rmse = np.sqrt(mean_squared_error(y_real, y_pred))
    cv_rmse = (rmse / y_mean) * 100.0
    nmbe = (np.sum(y_real - y_pred) / ((n - p) * y_mean)) * 100.0
    r2 = r2_score(y_real, y_pred)
    mae = mean_absolute_error(y_real, y_pred)
    aprovado = (cv_rmse < 15.0) and (abs(nmbe) < 5.0)
    return {
        "CV_RMSE_pct": round(cv_rmse, 2),
        "NMBE_pct": round(nmbe, 2),
        "R2": round(r2, 4),
        "MAE": round(mae, 3),
        "Status": "APROVADO (ASHRAE 14)" if aprovado else "REPROVADO"
    }
""",

    "requirements.txt": """numpy>=1.24.0
scipy>=1.10.0
pandas>=2.0.0
scikit-learn>=1.3.0
lightgbm>=4.0.0
joblib>=1.3.0
"""
}

for path, content in files.items():
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] Criado: {path}")

print("\n=== TODOS OS ARQUIVOS DO DCCALOR FORAM CRIADOS COM SUCESSO! ===")
