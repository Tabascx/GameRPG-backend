import strawberry
from typing import Annotated, Union
from app.firebase_conf import db
from app.auth import get_current_user
from app.jugadors.types import Jugador, Millora, RegistrarJugadorInput, ComprarMilloraInput, ErrorJugadorBanejat, ErrorSenseMonedes
from strawberry.types import Info

COST_MILLORA = {
    "muralla": 150.0,
    "taberna": 100.0,
    "cofre": 200.0,
}

@strawberry.type
class JugadorsMutation:
    @strawberry.mutation
    def registrar_jugador(self, input: RegistrarJugadorInput, info: Info) -> Jugador:
        user = get_current_user(info)
        uid = user["uid"]
        data = {
            "nickname": input.nickname,
            "monedes": 400.0,
            "dia_actual": 1,
            "banejat": False
        }
        db.collection("jugadors").document(uid).set(data)
        return Jugador(id=uid, millores=[], **data)

    @strawberry.mutation
    def comprar_millora(self, input: ComprarMilloraInput, info: Info) -> Union[Millora, ErrorSenseMonedes, ErrorJugadorBanejat]:
        ref = db.collection("jugadors").document(input.jugador_id)
        doc = ref.get()
        data = doc.to_dict()

        if data.get("banejat"):
            return ErrorJugadorBanejat(missatge="Jugador banejat")

        cost = COST_MILLORA.get(input.nom, 100.0)
        if data["monedes"] < cost:
            return ErrorSenseMonedes(missatge=f"No tens prou monedes. Necessites {cost}$")

        ref.update({"monedes": data["monedes"] - cost})
        millora_data = {"nom": input.nom, "descripcio": input.descripcio, "nivell": 1}
        nova = db.collection("jugadors").document(input.jugador_id).collection("inventari").add(millora_data)
        return Millora(id=nova[1].id, **millora_data)