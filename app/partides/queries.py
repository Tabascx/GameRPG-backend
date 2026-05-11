import strawberry
from typing import Optional
from app.firebase_conf import db
from app.partides.types import Partida, ResultatJoc

@strawberry.type
class PartidesQuery:
    @strawberry.field
    def llistar_partides(
        self,
        jugador_id: Optional[str] = None,
        estat: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> list[Partida]:
        query = db.collection("partides")
        if jugador_id:
            query = query.where("jugador_id", "==", jugador_id)
        if estat:
            query = query.where("estat", "==", estat)
        docs = list(query.stream())
        docs = docs[offset: offset + limit]
        return [Partida(id=d.id, **d.to_dict()) for d in docs]

    @strawberry.field
    def resultats_partida(self, partida_id: str) -> list[ResultatJoc]:
        docs = db.collection("partides").document(partida_id).collection("puntuacions").stream()
        return [ResultatJoc(id=d.id, **d.to_dict()) for d in docs]