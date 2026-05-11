import strawberry
from typing import Optional

@strawberry.type
class ResultatJoc:
    id: str
    jugador_id: str
    joc: str
    monedes_apostades: float
    monedes_resultat: float
    guanyat: bool
    dia: int

@strawberry.type
class Partida:
    id: str
    jugador_id: str
    mapa: str
    estat: str
    dia: int
    data_creacio: str

@strawberry.input
class CrearPartidaInput:
    jugador_id: str
    dia: int

@strawberry.input
class RegistrarResultatInput:
    partida_id: str
    jugador_id: str
    joc: str
    monedes_apostades: float
    monedes_resultat: float
    guanyat: bool
    dia: int

@strawberry.type
class ErrorPartidaNoTrobada:
    missatge: str