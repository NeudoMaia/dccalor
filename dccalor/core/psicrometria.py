import numpy as np

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
