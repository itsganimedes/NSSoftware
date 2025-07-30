//variables
/*
0=comun
1=raro
2=extremadamente raro
3=legendario
4=mitico
*/
let rareza=[
    2,  //pablo
    3,   //leonardo
    4,
    0,
    1
];

let nfts = document.querySelectorAll(".nft");

for (let i = 0; i < nfts.length; i++) {
    let nft = nfts[i];

    // Buscamos el span dentro de .nft-desc que representa la rareza
    let spanRareza = nft.querySelector(".rareza + span");

    // Según el valor del array, le agregamos la clase correspondiente
    if (rareza[i] === 3) {
        spanRareza.classList.add("legen");
        spanRareza.textContent = "Legendario";
    } else if (rareza[i] === 2) {
        spanRareza.classList.add("extraro");
        spanRareza.textContent = "Extremadamente Raro";
    } else if (rareza[i] === 1) {
        spanRareza.classList.add("raro");
        spanRareza.textContent = "Raro";
    } else if (rareza[i] === 0) {
        spanRareza.classList.add("comun");
        spanRareza.textContent = "Común";
    } else if (rareza[i] === 4) {
        spanRareza.classList.add("mitico");
        spanRareza.textContent = "Mítico";
    }
}
