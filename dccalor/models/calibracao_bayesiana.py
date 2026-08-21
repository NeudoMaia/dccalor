import numpy as np
from scipy.optimize import minimize

class CalibradorBayesiano:
    def __init__(self, area_m2: float = 250.0, volume_m3: float = 600.0):
        self.area = area_m2
        self.volume = volume_m3
        self.c_ar = 1.204 * volume_m3 * 1.006

    def calibrar(self, t_ext, t_int_real, q_ti_kw, dt_seg: float = 900.0):
        def perda(p):
            u_val, c_efetiva = p
            c_tot = max(self.c_ar + c_efetiva, 100.0)
            t_pred = np.zeros(len(t_ext))
            t_pred[0] = t_int_real[0]
            for i in range(1, len(t_ext)):
                t_ant = np.clip(t_pred[i-1], -30.0, 70.0)
                q_cond = (u_val * self.area * (t_ext[i-1] - t_ant)) / 1000.0
                q_liq = q_cond + q_ti_kw[i-1]
                t_pred[i] = t_ant + (q_liq / c_tot) * dt_seg
            
            t_pred = np.nan_to_num(t_pred, nan=100.0, posinf=100.0, neginf=-100.0)
            return np.sqrt(np.mean((t_int_real - t_pred)**2))

        res = minimize(perda, [1.8, 4000.0], bounds=[(0.1, 8.0), (100.0, 50000.0)], method="L-BFGS-B")
        return {"u_calibrado": float(res.x[0]), "c_efetiva": float(res.x[1]), "rmse": float(res.fun)}
