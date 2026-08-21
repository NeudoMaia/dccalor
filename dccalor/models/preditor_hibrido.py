import lightgbm as lgb
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
