import numpy as np
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
