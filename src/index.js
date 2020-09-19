//----------------------------------------------------------------------------------------------------------------------
//Jeu de la vie.
//CHEVRIER Jean-Christophe.
//09/2020.



//----------------------------------------------------------------------------------------------------------------------
//Constantes et variables.

// Id du plateau.
let __BOARD__ = "#board";
let __BOARD_MANAGER__ = __BOARD__ + "-manager";

//Classes pour les classes du plateau.
let __BOARD_MANAGER_CLASS__ = "board-manager";
let __BOARD_MANAGER_CLOSED_CLASS__ = "board-manager-closed";
let __BOARD_MANAGER_MOVED_CLASS__ = "board-manager-moved";

//Classes pour les boutons.
let __CLOSE_BUTTON__ = "#close-button";
let __RESET_BUTTON__ = "#reset-button";
let __RUN_BUTTON__ = "#run-button";
let __STOP_BUTTON__ = "#stop-button";
let __LOAD_BUTTON__ = "#load-button";
let __SAVE_BUTTON__ = "#save-button";

//Classes pour les couleurs des cases.
let __BLACK_TILE_CLASS__ = "black-tile";
let __WHITE_TILE_CLASS__ = "white-tile";

//Nombre de tuiles du plateau.
let nbTiles = 0;
//Nombre de lignes et de colonnes du plateau.
let nbRows;
let nbColumns;

//Dimensions du plateau en pixels.
let __WIDTH_BOARD__ = parseInt($(window).width());
let __HEIGHT_BOARD__ = parseInt($(window).height());
//Taille des tuiles en pixels (largeur = longueur, les tuiles sont des carres).
let sizeTile;

//Plateau virtuel.
let board;
//Plateau virtuel intermediaire.
let boardTmp;

//Booleen pour savoir si on est en train de deplacer le getsionnaire du jeu.
let boardManagerIsMoved = false;
//Precdente position de la souris.
let currentMouseXPosition = -1;
let currentMouseYPosition = -1;

//Exceution du jeu de la vie.
let gameLifeRunning = null;

//Numero de la generation.
let numGeneration = 0;

let ignoreClick = false;



//----------------------------------------------------------------------------------------------------------------------
//Methode de gestion du plateau physique.

/**
 * (Re-)initialiser le plateau physique.
 */
function resetBoard() {
    board = [];
    $(__BOARD__).children().remove();
    let nbTilesBuilt = 0;
    let arrayTmp = [];
    board.push(arrayTmp);
    let index1D = 0;
    let index2D = -1;
    while(nbTilesBuilt < nbTiles) {
        if(index2D !== 0 && index2D % (nbColumns - 1) === 0) {
            arrayTmp = [];
            board.push(arrayTmp);
            index1D++;
            index2D = 0;
        } else {
            index2D++;
        }
        arrayTmp.push(__BLACK_TILE_CLASS__);
        $(__BOARD__).append("<div data-index-1d='" + index1D + "' data-index-2d='" + index2D + "' class='" + __BLACK_TILE_CLASS__ +
                            "' style='width:"+ sizeTile +"px; height:"+ sizeTile +"px;'></div>");
        nbTilesBuilt++;
    }
}

/**
 * Poser / retirer une cellule sur une tuile.
 * @param e
 */
function toggleTile(tileNode) {
    tileNode.toggleClass(__BLACK_TILE_CLASS__);
    tileNode.toggleClass(__WHITE_TILE_CLASS__);
    board[parseInt(tileNode.attr("data-index-1d"))][parseInt(tileNode.attr("data-index-2d"))] = tileNode.attr('class').replace(" ", "");
}



//----------------------------------------------------------------------------------------------------------------------
//Methodes de gestion du jeu de la vie.

/**
 * Recuperer les tuiles voisines à une tuile.
 *
 * Exemple :
 * vvv
 * vtv
 * vvv
 * t la tuile, v la tuile voisine.
 *
 * @param index1D
 * @param index2D
 * @returns {Array}
 */
function getNeighbourTiles(index1D, index2D) {
    let neighbourTiles = [];
    let index1DSupMin = index1D > 0;
    let index1DInfMax = index1D < (nbRows - 1);
    let index2DSupMin = index2D > 0;
    let index2DInfMax = index1D < (nbColumns - 1);
    if(index1DSupMin) {
        neighbourTiles.push(board[index1D - 1][index2D]);
    }
    if(index1DInfMax) {
        neighbourTiles.push(board[index1D + 1][index2D]);
    }
    if(index2DSupMin) {
        neighbourTiles.push(board[index1D][index2D - 1]);
    }
    if(index2DInfMax) {
        neighbourTiles.push(board[index1D][index2D + 1]);
    }
    if(index1DSupMin && index2DSupMin) {
        neighbourTiles.push(board[index1D - 1][index2D - 1]);
    }
    if(index1DSupMin && index2DInfMax) {
        neighbourTiles.push(board[index1D - 1][index2D + 1]);
    }
    if(index1DInfMax && index2DSupMin) {
        neighbourTiles.push(board[index1D + 1][index2D - 1]);
    }
    if(index1DInfMax && index2DInfMax) {
        neighbourTiles.push(board[index1D + 1][index2D + 1]);
    }
    return neighbourTiles;
}

/**
 * Faire evoluer une cellule (naitre / survivre / mourir).
 *
 * @param index1D
 * @param index2D
 */
function cellEvolve(index1D, index2D) {
    let tile = board[index1D][index2D];
    let neighbourTiles = getNeighbourTiles(index1D, index2D);
    let nbNeighbourCells = neighbourTiles.reduce(
        (nbNeighbourCells, neighbourTile) => nbNeighbourCells + (neighbourTile === __WHITE_TILE_CLASS__ ? 1 : 0), 0);
    if(tile === __WHITE_TILE_CLASS__) {
        if(nbNeighbourCells !== 2 && nbNeighbourCells !== 3) {
            boardTmp[index1D][index2D] = __BLACK_TILE_CLASS__;
        }
    } else {
        if(nbNeighbourCells === 3) {
            boardTmp[index1D][index2D] = __WHITE_TILE_CLASS__;
        }
    }
}

/**
 * Faire evoluer tout le plateau
 * et ainsi passer a la generation suivante.
 */
function nextGeneration() {
    boardTmp = [];
    board.forEach(arrayTiles => boardTmp.push(new Array(arrayTiles.length)));
    board.forEach((arrayTiles, index1D) => arrayTiles.forEach((tile, index2D) => boardTmp[index1D][index2D] = tile));

    board.forEach((arrayTiles, index1D) => arrayTiles.forEach((tile, index2D) => cellEvolve(index1D, index2D)));

    board = boardTmp;

    $(__BOARD__).children().each((index, tileNode) => {
        tileNode = $(tileNode);
        if(tileNode.attr('class').replace(" ", "") !== board[tileNode.attr("data-index-1d")][tileNode.attr("data-index-2d")]) {
            tileNode.toggleClass(__BLACK_TILE_CLASS__);
            tileNode.toggleClass(__WHITE_TILE_CLASS__);
        }
    });

    numGeneration++;
    $("#num-generation").text(numGeneration);
}

/**
 * Demarrer une session du jeu de la vie.
 */
function runLifeGame() {
    gameLifeRunning = setInterval(nextGeneration, parseInt($("#input-board-time-between-generations").val()));
    $(__RUN_BUTTON__).attr("disabled", true);
    $(__STOP_BUTTON__).attr("disabled", false);
}

/**
 * Arreter la session courante du jeu de la vie.
 */
function stopLifeGame() {
    clearInterval(gameLifeRunning);
    $(__RUN_BUTTON__).attr("disabled", false);
    $(__STOP_BUTTON__).attr("disabled", true);
    gameLifeRunning = null;
}

/**
 * (Re)-initialiser le jeu de la vie.
 */
function resetLifeGame() {
    if(gameLifeRunning != null) {
        clearInterval(gameLifeRunning);
        gameLifeRunning = null;
    }
    sizeTile = parseInt($("#input-board-size-tile").val());
    nbTiles = parseInt($("#input-board-nb-tiles").val());
    if(nbTiles > 0) {
        nbColumns = parseInt(__WIDTH_BOARD__ / (sizeTile+2));
        nbRows = parseInt(nbTiles / nbColumns);
        resetBoard();
        if($(__RUN_BUTTON__).attr("disabled"))
            $(__RUN_BUTTON__).attr("disabled", false);
        if(!$(__STOP_BUTTON__).attr("disabled"))
            $(__STOP_BUTTON__).attr("disabled", true);
        if($(__SAVE_BUTTON__).attr("disabled"))
            $(__SAVE_BUTTON__).attr("disabled", false);
        numGeneration = 0;
        $("#num-generation").text("0");
        $("#num-generation").attr("style", "visibility: visible;");
    }
}



//----------------------------------------------------------------------------------------------------------------------
//Methodes pour le gestionnaire du jeu de la vie.

/**
 * Commencer le deplacement du gestionnaire.
 */
function startMoveBoardManager() {
    if(!boardManagerIsMoved)
        boardManagerIsMoved = true;
}

/**
 * Deplacer le gestionnaire.
 *
 * @param newMouseXPosition
 * @param newMouseYPosition
 */
function moveBoardManager(newMouseXPosition, newMouseYPosition) {
    if(boardManagerIsMoved) {
        if(!$(__BOARD_MANAGER__).hasClass(__BOARD_MANAGER_MOVED_CLASS__))
            $(__BOARD_MANAGER__).addClass(__BOARD_MANAGER_MOVED_CLASS__);
        let boardManager = $(__BOARD_MANAGER__);
        let topValue = parseInt(boardManager.css("top").replace("px", ""));
        let leftValue = parseInt(boardManager.css("left").replace("px", ""));
        let widthValue = parseInt(boardManager.width());
        let heightValue = parseInt(boardManager.height());
        let offsetX = currentMouseXPosition === -1 ? 0 : newMouseXPosition - currentMouseXPosition;
        let offsetY = currentMouseYPosition === -1 ? 0 : newMouseYPosition - currentMouseYPosition;
        currentMouseXPosition = newMouseXPosition;
        currentMouseYPosition = newMouseYPosition;
        if(offsetY > 0) {
            if((topValue + offsetY + heightValue) <= (__HEIGHT_BOARD__ - 30)) {
                boardManager.css("top", (topValue + offsetY) + "px");
            }
        } else {
            if((topValue + offsetY) >= 0) {
                boardManager.css("top", (topValue + offsetY) + "px");
            }
        }
        if(offsetX > 0) {
            if((leftValue + offsetX + widthValue) <= (__WIDTH_BOARD__ - 40)) {
                boardManager.css("left", (leftValue + offsetX) + "px");
            }
        } else {
            if((leftValue + offsetX) >= 0) {
                boardManager.css("left", (leftValue + offsetX) + "px");
            }
        }
    }
}

/**
 * Arreter le deplacement du gestionnaire.
 */
function stopMoveBoardManager() {
    if(boardManagerIsMoved) {
        boardManagerIsMoved = false;
        if($(__BOARD_MANAGER__).hasClass(__BOARD_MANAGER_MOVED_CLASS__))
            $(__BOARD_MANAGER__).removeClass(__BOARD_MANAGER_MOVED_CLASS__);
        currentMouseXPosition = -1;
        currentMouseYPosition = -1;
    }
}

/**
 *  Ouvrir le getsionnaire.
 */
function openBoardManager() {
    if(ignoreClick) {
        ignoreClick = false;
    } else {
        $(__BOARD_MANAGER__).addClass(__BOARD_MANAGER_CLASS__);
        $(__BOARD_MANAGER__).removeClass(__BOARD_MANAGER_CLOSED_CLASS__);
        $(__BOARD_MANAGER__).attr("style","top: 30px; left: "+ (__WIDTH_BOARD__ - 70 - parseInt($(__BOARD_MANAGER__).width())) +"px;");
    }
}

/**
 * Fermer le gestionnaire.
 */
function closeBoardManager() {
    $(__BOARD_MANAGER__).removeClass(__BOARD_MANAGER_CLASS__);
    $(__BOARD_MANAGER__).addClass(__BOARD_MANAGER_CLOSED_CLASS__);
    $(__BOARD_MANAGER__).attr("style","top: " + (__HEIGHT_BOARD__ - 30 - parseInt($(__BOARD_MANAGER__).height())) + "px; " +
        "left: "+ (__WIDTH_BOARD__ - 30 - parseInt($(__BOARD_MANAGER__).width())) +"px;");
    ignoreClick = true;
}

/**
 * Verifier les champs du gestionnaire.
 */
function checkFieldsOfBoardManager() {
    if($("#input-board-size-tile:invalid, #input-board-nb-tiles:invalid").length === 0) {
        if($(__RESET_BUTTON__).attr("disabled"))
            $(__RESET_BUTTON__).attr("disabled", false);
    } else {
        if(!$(__RESET_BUTTON__).attr("disabled"))
            $(__RESET_BUTTON__).attr("disabled", true);
    }
    if($("#input-board-time-between-generations:invalid").length === 0) {
        if(nbTiles !== 0 && $(__RUN_BUTTON__).attr("disabled"))
            $(__RUN_BUTTON__).attr("disabled", false);
    } else {
        if(!$(__RUN_BUTTON__).attr("disabled"))
            $(__RUN_BUTTON__).attr("disabled", true);
    }
}



//----------------------------------------------------------------------------------------------------------------------
//Handlers.

$(() => {
    //Chargement...
    $(__BOARD_MANAGER__).attr("style","top: 30px; left: "+ (__WIDTH_BOARD__ - 70 - parseInt($(__BOARD_MANAGER__).width())) +"px;");
    $("#input-board-width").val(__WIDTH_BOARD__);
    $("#input-board-height").val(__HEIGHT_BOARD__);
    $("body").attr("style", "visibility: visible;");
    //Handlers...
    //Gestion de l'edition du plateau.
    $(document).on("click", "." +__WHITE_TILE_CLASS__ + ", ."  + __BLACK_TILE_CLASS__, (e) => toggleTile($(e.target)));
    //Gestion du deplacement du gestionnaire.
    $(document).on("mousedown", ".board-manager", startMoveBoardManager);
    $(document).on("mousemove", (e) => moveBoardManager(e.pageX, e.pageY));
    $(document).on("mouseup", stopMoveBoardManager);
    //Actions lies aux boutons du gestionnaire.
    $(__CLOSE_BUTTON__).on("click", closeBoardManager); //Gestion ouverture/fermeture du gestionnaire.
    $(document).on("click", ".board-manager-closed", openBoardManager);
    $(__RESET_BUTTON__).on("click", resetLifeGame);  //Arreter la session coura,te du jeu de la vie et reinitilialiser le plateau.
    $(__RUN_BUTTON__).on("click", runLifeGame); //Demarrer une session du jeu de la vie.
    $(__STOP_BUTTON__).on("click", stopLifeGame); //Arreter la session courante du jeu de la vie.
    ///Verification des champs du gestionnaire.
    $(__BOARD_MANAGER__ + "> input").on("keyup change", checkFieldsOfBoardManager);
});
