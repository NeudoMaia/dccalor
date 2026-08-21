import sqlite3
import pandas as pd
import os

class DatabaseManager:
    def __init__(self, db_path: str = "dccalor_banco.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS fato_telemetria (
                    timestamp TEXT PRIMARY KEY,
                    temperatura REAL,
                    umidade REAL,
                    entalpia_ar REAL,
                    vpd REAL,
                    temp_orvalho REAL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS log_auditoria_ashrae (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    cv_rmse REAL,
                    nmbe REAL,
                    r2 REAL,
                    status TEXT
                )
            """)

    def salvar_dados(self, df: pd.DataFrame):
        with sqlite3.connect(self.db_path) as conn:
            df.to_sql("fato_telemetria", conn, if_exists="append", index=True)
