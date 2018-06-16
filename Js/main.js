
var businessController = (function(){
    var history = {
            white: [],
            black: []
        }

    return{
        camelize: function(str) {
              return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
                return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
              }).replace(/\s+/g, '');
            } ,
        headUpper: function (str) {
              return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
                return index == 0 ? letter.toUpperCase(): letter.toLowerCase() ;
              }).replace(/\s+/g, '');
            },
        getHistory: function(){
            return history;
        },
        addHistory: function(orientation, move){
            history[orientation].push(move);
        },
        undoHistory: function(orientation){
            history[orientation].pop();
        },
        clearHistory: function(orientation){
            history['white'] = [];
            history['black'] = [];
        }

    }
})();

var uiController = (function(){

    return{
        setHistory: function(orientation, history){
            let lblOr = '.' + orientation;
            $(lblOr).text(history[orientation].toString())   
        },
        setOrientation: function(orientation){
            $('#lblTurn').text(orientation); 
        },
        disableBtn: function(id){            
            $(id).attr("disabled", true);
        },
        enableBtn: function(id){
            $(id).attr("disabled", false);
        }
    }
})();

var appController = (function(bCtrl, uCtrl){

    var cfg, board, game, history, isDraged;

    history = bCtrl.getHistory();
    const setEventListener = function(){
         $('#nextMove').on('click',function(){

            uCtrl.disableBtn('#nextMove');
            isDraged = false;

            var possibleMoves = game.moves();

            // exit if the game is over
            if (game.game_over() === true || game.in_draw() === true || possibleMoves.length === 0) 
                    return;

            var randomIndex = Math.floor(Math.random() * possibleMoves.length);
            game.move(possibleMoves[randomIndex]);

            board.position(game.fen());

            //history[board.orientation()].push(possibleMoves[randomIndex]);
            bCtrl.addHistory(board.orientation(), possibleMoves[randomIndex]);

            uCtrl.setHistory(board.orientation(), history);

            window.setTimeout(function(){ 
                board.flip();
                //$('#lblTurn').text(bCtrl.headUpper(board.orientation()));
                uCtrl.setOrientation(bCtrl.headUpper(board.orientation()));
            }, 500);  

            uCtrl.enableBtn('#nextMove');

         });
         $('#undoMove').on('click',function(){
                 uCtrl.disableBtn('#undoMove');
                 if(history['black'].length > 0 || history['white'].length > 0){
                     game.undo();
                     board.position(game.fen());
                     board.flip();

                     if(history[board.orientation()].length > 0){
                         bCtrl.undoHistory(board.orientation());
                         uCtrl.setHistory(board.orientation(), history);
                         uCtrl.setOrientation(bCtrl.headUpper(board.orientation()));

                     }
                 }
                uCtrl.enableBtn('#undoMove');    

         });
         $('#resetAll').on('click',function(){
            console.log('reset');
            game.reset();
            board.start();
            if(board.orientation() === 'black'){
                board.flip();
            }
            bCtrl.clearHistory();
            uCtrl.setHistory('white', history);  
            uCtrl.setHistory('black', history);  
        });            
     };

    var onChange = function(oldPos, newPos){
        //console.log('onchange')
        if(isDraged){
            const moveHist = game.history()
            const lastMove = moveHist[moveHist.length - 1];
            const orientation =board.orientation();

            bCtrl.addHistory(orientation, lastMove);
            uCtrl.setHistory(orientation, history);  
            isDraged = false;
        }         

    }

    //onDragStart Event
    var onDragStart = function(source, piece, position, orientation) {
       // console.log("Drag started:");
        if(game.game_over() === true )
           //|| (game.turn() === 'b' && piece.search(/^w/) !== -1) 
           //|| (game.turn() === 'w' && piece.search(/^b/) !== -1) )
                return false;
        isDraged = true;            
    };

    //onDrop Event
    var onDrop = function(source, target){
        //console.log('ondrop')
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if(move === null) return 'snapback'
        else{
            window.setTimeout(function(){ board.flip()}, 500);  
        }
    } ; 


    return{
        initGame: function(){

            cfg = {
                draggable: true,
                position : 'start',
                onChange: onChange,
                onDragStart: onDragStart,
                onDrop: onDrop
            };
            board = ChessBoard('board', cfg);
            game = new Chess();
            $('#lblTurn').text(bCtrl.headUpper(board.orientation()));
            setEventListener();
            isDraged = false;
        }   
    }
})(businessController, uiController);

//init Game.
appController.initGame();

