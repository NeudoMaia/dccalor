import numpy as np

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
