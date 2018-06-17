
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
    let wCounter = 0, bCounter =0 , TotalTime = 300, wInterval, bInterval;
    
    var domObject = {
        wTimerDiv: '#wTimerDiv',
        bTimerDiv: '#bTimerDiv',
        lblTurn: '#lblTurn',
        nextMove: '#nextMove',
        undoMove: '#undoMove',
        resetAll: '#resetAll',
        start: '#start',
        lblTurn: '#lblTurn',
        bTimerDiv: '#bTimerDiv',
        wTimerDiv: '#wTimerDiv',
        pause: '#pause'
        
    }
    
    var whiteTimer = function(){
        wCounter += 1;    
        $(domObject.wTimerDiv).text(convertTime(TotalTime - wCounter)); 
    }
    
    var blackTimer = function(){
        bCounter += 1;        
        $(domObject.bTimerDiv).text(convertTime(TotalTime - bCounter)); 
    }
    
    var convertTime = function(counter){
        let min = Math.floor(counter/60);
        let sec = counter % 60;
        if(counter < 1){
            clearInterval(bInterval);
            clearInterval(wInterval);            
            stopGame();
            return '00:00';
        }
        return '0' + min + ':' + (sec < 10 ? '0'+ sec : sec) ;
    }
    
    var stopGame = function(){
        toggleBtnVisible(DOMObject.nextMove, true);
        //toggleBtnVisible(DOMObject.resetAll, true);
        toggleBtnVisible(DOMObject.undoMove, true);
        toggleBtnVisible(DOMObject.pause, true);
        document.getElementById('bTimerDiv').style.pointerEvents = 'none';
        document.getElementById('wTimerDiv').style.pointerEvents = 'none';
        bCounter = 0;
        wCounter = 0
    }
    var toggleBtnVisible = function(id, flag ){
         $(id).attr("disabled", flag);
    }
    return{
        setHistory: function(orientation, history){
            let lblOr = '.' + orientation;
            $(lblOr).text(history[orientation].toString())   
        },
        setOrientation: function(orientation){
            $(domObject.lblTurn).text(orientation); 
        },
        disableBtn: function(id){            
           toggleBtnVisible(id, true);
        },
        enableBtn: function(id){
            toggleBtnVisible(id, false);
        },
        startWhiteTimer: function(){
            wInterval =setInterval(whiteTimer, 1000); 
            $(domObject.wTimerDiv).attr('style',  'background-color: orange');
            $(domObject.bTimerDiv).attr('style',  'background-color: gray');
        },
        startBlackTimer: function(){
            bInterval = setInterval(blackTimer, 1000);
            $(domObject.bTimerDiv).attr('style',  'background-color: orange');
            $(domObject.wTimerDiv).attr('style',  'background-color: gray');
        },
        clearWhiteTimer: function(){
            clearInterval(wInterval);            
        },
        clearBlackTimer: function(){
            clearInterval(bInterval);            
        },
        resetTimer: function(){
            clearInterval(wInterval);            
            clearInterval(bInterval);            
            $(domObject.bTimerDiv).text('05:00'); 
            $(domObject.wTimerDiv).text('05:00'); 
            $(domObject.wTimerDiv).attr('style',  'background-color: gray');
            $(domObject.bTimerDiv).attr('style',  'background-color: gray');
            bCounter = 0;
            wCounter = 0
        },
        DOMObject: function(){
            return domObject;
        }
    }
    
})();

var appController = (function(bCtrl, uCtrl){

    var cfg, board, game, history, isDraged, isPaused = false, turn = '';
    
    DOMObject = uCtrl.DOMObject();
    history = bCtrl.getHistory();
    
    const setEventListener = function(){
        $(DOMObject.nextMove).on('click',function(){

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
        $(DOMObject.undoMove).on('click',function(){
             uCtrl.disableBtn('#undoMove');
             if(history['black'].length > 0 || history['white'].length > 0){
                 var undoMove = game.undo();
                 board.position(game.fen());
                 board.flip();
                 let color = board.orientation();    
                 if(history[color].length > 0){
                     bCtrl.undoHistory(color);
                     uCtrl.setHistory(color, history);
                     uCtrl.setOrientation(bCtrl.headUpper(color));
                 }
                 if(color === 'white'){
                     $('#wTimerDiv').attr('style',  'background-color: orange');
                     $('#bTimerDiv').attr('style',  'background-color: gray');
                     uCtrl.clearBlackTimer();
                     uCtrl.startWhiteTimer();
                     turn = 'white';
                 }else{
                     $('#bTimerDiv').attr('style',  'background-color: orange');
                     $('#wTimerDiv').attr('style',  'background-color: gray');
                     uCtrl.clearWhiteTimer();
                     uCtrl.startBlackTimer();
                     turn = 'black';
                 }
             }
             uCtrl.enableBtn('#undoMove');    

         });
        $(DOMObject.resetAll).on('click',function(){
            console.log('reset');
            game.reset();
            board.start();
            if(board.orientation() === 'black'){
                board.flip();
            }
            bCtrl.clearHistory();
            uCtrl.setHistory('white', history);  
            uCtrl.setHistory('black', history); 
            uCtrl.resetTimer();
            disableGame();
        }); 
        $(DOMObject.start).on('click',function(){
            
            game = new Chess();  
             $(DOMObject.lblTurn).text(bCtrl.headUpper(board.orientation()));
             enableGame();
             uCtrl.startWhiteTimer();
            turn = 'white';
         });        
        $(DOMObject.bTimerDiv).on('click',function(){
            if(turn === 'black'){
                turn = 'white';
                document.getElementById('bTimerDiv').style.pointerEvents = 'none';
                console.log('bTimeer')
                uCtrl.clearBlackTimer();
                uCtrl.startWhiteTimer();
                document.getElementById('wTimerDiv').style.pointerEvents = 'auto';
            }
        });
        $(DOMObject.wTimerDiv).on('click',function(){
            if(turn === 'white'){
                turn = 'black';
                document.getElementById('wTimerDiv').style.pointerEvents = 'none';
                console.log('wTimeer'); 
                uCtrl.clearWhiteTimer();
                uCtrl.startBlackTimer();
                document.getElementById('bTimerDiv').style.pointerEvents = 'auto';
            }
            
        });
        
        $(DOMObject.pause).on('click',function(){
            const orientation =board.orientation();
            if(isPaused){
                if( orientation === 'white'){
                    uCtrl.startWhiteTimer();  
                    document.getElementById('bTimerDiv').style.pointerEvents = 'auto';
                }else{
                    uCtrl.startBlackTimer();    
                    document.getElementById('wTimerDiv').style.pointerEvents = 'auto';
                }                              
                isPaused = false;
                $(DOMObject.pause).attr('value', 'Pause');
                $(DOMObject.undoMove).attr('disabled', false);               
                
            }else{
                uCtrl.clearBlackTimer();
                uCtrl.clearWhiteTimer();   
                isPaused = true;
                $(DOMObject.pause).attr('value', 'Resume');
                $(DOMObject.undoMove).attr('disabled', true);
                document.getElementById('bTimerDiv').style.pointerEvents = 'none';
                document.getElementById('wTimerDiv').style.pointerEvents = 'none';
            }
            
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

    //
    var onSnapEnd = function(){
        board.position(game.fen());
    }
    var disableGame = function(){
        uCtrl.disableBtn(DOMObject.nextMove);
        uCtrl.disableBtn(DOMObject.resetAll);
        uCtrl.disableBtn(DOMObject.undoMove);
        uCtrl.disableBtn(DOMObject.pause);
        document.getElementById('bTimerDiv').style.pointerEvents = 'none';
        document.getElementById('wTimerDiv').style.pointerEvents = 'none';
        
    }
    var enableGame = function(){
        uCtrl.enableBtn(DOMObject.nextMove);
        uCtrl.enableBtn(DOMObject.resetAll);
        uCtrl.enableBtn(DOMObject.undoMove);
        uCtrl.enableBtn(DOMObject.pause);
        document.getElementById('wTimerDiv').style.pointerEvents = 'auto';
        
    }
    
    return{
        initGame: function(){

            cfg = {
                draggable: true,
                position : 'start',
                onChange: onChange,
                onDragStart: onDragStart,
                onDrop: onDrop,
                onSnapEnd: onSnapEnd
                
            };
            board = ChessBoard('board', cfg);          
            setEventListener();
            isDraged = false;
            disableGame();
        }
    }
})(businessController, uiController);

//init Game.
appController.initGame();

