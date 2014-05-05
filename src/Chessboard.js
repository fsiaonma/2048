cc.sys.dump();

var Chessboard = cc.Layer.extend({
    _lock: false,

    init: function() {
        var bRet = false;
        if (this._super()) {
            var ws = Global.ws = cc.director.getWinSize();

            var buffer = Global.buffer = 8;
            var singleW =Global.singleW = Math.round((ws.width - 5 * buffer) / 4);

            var chessboardRect = Global.chessboard = {
                left: buffer,
                buttom: buffer,
                top: 4 * (buffer + singleW),
                right: 4 * (buffer + singleW)
            }

            var bg = cc.LayerColor.create(cc.color(187, 173, 160, 1000), ws.width, ws.height);
            bg.ignoreAnchorPointForPosition(true);
            bg.setPosition(cc.p(0, 0));
            this.addChild(bg);

            var txt = cc.LabelTTF.create("2048", "", this.width, 50, cc.TEXT_ALIGNMENT_LEFT);
            txt.setPosition(cc.p(this.width / 2, this.height * 4 / 5));
            txt.font = "68px Arial";
            this.addChild(txt);
            this.txt = txt;

            var chessboard = this.chessboard = [];
            var boxes = this.boxes = [];

            for (var i = 0; i < 4; ++i) {
                for (var j = 0; j < 4; ++j) {
                    if (!chessboard[i]) {
                        chessboard[i] = [];
                    }
                    if (!chessboard[i][j]) {
                        chessboard[i][j] = {};
                    }
                    chessboard[i][j].pos = cc.p(singleW * i + buffer * (i + 1), singleW * j + buffer * (j + 1));

                    var layer = cc.LayerColor.create(cc.color(204, 192, 179, 1000), singleW, singleW);
                    layer.ignoreAnchorPointForPosition(true);
                    layer.setPosition(chessboard[i][j].pos);
                    bg.addChild(layer);
                }
            }

            for (var i = 0; i < 2; ++i) {
                this._generateBox();
            }

            if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
                var self = this;
                cc.eventManager.addListener({
                    event: cc.EventListener.KEYBOARD,
                    onKeyPressed: function (key, event) {
                        if (!self._lock) {
                            self._lock = true;
                            self._keyCallback(key);
                        }
                    },
                    onKeyReleased:function (key, event) {
                    }
                }, this);
            }

            // this.scheduleUpdate();
                
            bRet = true;
        }
        return bRet;
    },

    _keyCallback: function(key) {
        switch (key) {
            case 38: {
                this._move("up");
                break;
            }
            case 37: {
                this._move("left");
                break;
            }
            case 40: {
                this._move("down");
                break;
            }
            case 39: {
                this._move("right");
                break;
            }
        }
    },

    _move: function(direction) {
        var exPos = [];
        var self = this;
        for (var i = 0, len = this.boxes.length - 1; i < len; ++i) {
            exPos.push({
                x: Math.round(this.boxes[i].getPositionX()),
                y: Math.round(this.boxes[i].getPositionY())
            });
            var pos = this._calculatePos(this.boxes[i], direction);
            this.boxes[i].move(pos);
        }
        var pos = this._calculatePos(this.boxes[this.boxes.length - 1], direction);
        this.boxes[this.boxes.length - 1].move(pos, function() {
            exPos.push({
                x: Math.round(self.boxes[self.boxes.length - 1].getPositionX()),
                y: Math.round(self.boxes[self.boxes.length - 1].getPositionY())
            });
            self._checkCombind();
            for (var i = 0, len = self.boxes.length; i < len; ++i) {
                var ix = Math.round(self.boxes[i].getPositionX());
                var iy = Math.round(self.boxes[i].getPositionY());
                if (ix != exPos[i].x || iy != exPos[i].y) {
                    self._generateBox();
                    break ;
                }
            }
            self._lock = false;
        });
    },

    _checkCombind: function() {
        var delArr = [];
        for (var i = 0, len = this.boxes.length; i < len; ++i) {
            var ix = Math.round(this.boxes[i].getPositionX());
            var iy = Math.round(this.boxes[i].getPositionY());
            for (var j = i + 1, l = this.boxes.length; j < l; ++j) {
                var jx = Math.round(this.boxes[j].getPositionX());
                var jy = Math.round(this.boxes[j].getPositionY());
                if (ix == jx && iy == jy) {
                    this.removeChild(this.boxes[i]);
                    this.boxes[j].setNum(this.boxes[i].value * 2);
                    delArr.push(i);
                }
            }
        }
        var arr = [];
        for (var i = 0, len = this.boxes.length; i < len; ++i) {
            var flag = false;
            for (var j = 0, l = delArr.length; j < l; ++j) {
                if (i == delArr[j]) {
                    flag = true;
                }
            }
            if (!flag) {
                arr.push(this.boxes[i]);
            }
        }
        this.boxes = arr;
    },

    _generateBox: function() {
        var index = 0;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                if (!this._isFull(this.chessboard[i][j])) {
                    ++index;
                }
            }
        }
        var random = Math.ceil(Math.random() * index);
        var index = 0;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) { 
                if (!this._isFull(this.chessboard[i][j])) {
                    if (++index == random) {
                        // 生成盒子
                        var box = BoxV.create();
                        box.setNum(Math.random() > 0.5? 2 : 4);
                        box.setPosition(this.chessboard[i][j].pos);
                        box.setScale(0);
                        this.addChild(box);
                        this.boxes.push(box);

                        var move = cc.ScaleTo.create(0.1, 1);
                        var seq = cc.Sequence.create(move);
                        box.runAction(seq);
                    }
                }
            }
        }
    },

    _calculatePos: function(box, direction) {
        var pos;
        switch(direction) {
            case "up": {
                pos = this._calUpPos(box, true);
                break;
            }
            case "down": {
                pos = this._calDownPos(box, true);
                break;
            }
            case "left": {
                pos = this._calLeftPos(box, true);
                break;
            }
            case "right": {
                pos = this._calRightPos(box, true);
                break;
            }
        }
        return pos;
    },

    _calUpPos: function(box, isCanCombind) {
        var boxX = Math.round(box.getPositionX());
        var boxY = Math.round(box.getPositionY());

        var pos = cc.p(boxX, Global.chessboard.top - Global.singleW);

        // 记下所有在当方块上方的所有方块
        var upBoxes = [];
        for (var i = 0, len = this.boxes.length; i < len; ++i) {
            var iBox = this.boxes[i];
            var ix = Math.round(iBox.getPositionX());
            var iy = Math.round(iBox.getPositionY());    

            if (boxX == ix && boxY < iy) {
                upBoxes.push(iBox);
            }
        }

        // 找出最近的一块方块
        if (upBoxes.length > 0) {
            var tempBox = upBoxes[0];
            for (var i = 0, len = upBoxes.length; i < len; ++i) {
                if (tempBox.getPositionY() > upBoxes[i].getPositionY()) {
                    tempBox = upBoxes[i];
                }
            }
            if (box.value == tempBox.value && isCanCombind) {
                var pos = this._calUpPos(tempBox, false);
            } else {
                var pos = this._calUpPos(tempBox, true);
                pos.y -= (Global.singleW + Global.buffer);    
            }
        }
        
        return pos;
    },

    _calDownPos: function(box, isCanCombind) {
        var boxX = Math.round(box.getPositionX());
        var boxY = Math.round(box.getPositionY());

        var pos = cc.p(boxX, Global.chessboard.buttom);

        // 记下所有在当方块下方的所有方块
        var downBoxes = [];
        for (var i = 0, len = this.boxes.length; i < len; ++i) {
            var iBox = this.boxes[i];
            var ix = Math.round(iBox.getPositionX());
            var iy = Math.round(iBox.getPositionY());    

            if (boxX == ix && boxY > iy) {
                downBoxes.push(iBox);
            }
        }

        // 找出最近的一块方块
        if (downBoxes.length > 0) {
            var tempBox = downBoxes[0];
            for (var i = 0, len = downBoxes.length; i < len; ++i) {
                if (tempBox.getPositionY() < downBoxes[i].getPositionY()) {
                    tempBox = downBoxes[i];
                }
            }
            if (box.value == tempBox.value && isCanCombind) {
                var pos = this._calDownPos(tempBox, false);
            } else {
                var pos = this._calDownPos(tempBox, true);
                pos.y += (Global.singleW + Global.buffer);    
            }
        }
        
        return pos;
    },

    _calLeftPos: function(box, isCanCombind) {
        var boxX = Math.round(box.getPositionX());
        var boxY = Math.round(box.getPositionY());

        var pos = cc.p(Global.chessboard.left, boxY);

        // 记下所有在当方块左方的所有方块
        var leftBoxes = [];
        for (var i = 0, len = this.boxes.length; i < len; ++i) {
            var iBox = this.boxes[i];
            var ix = Math.round(iBox.getPositionX());
            var iy = Math.round(iBox.getPositionY());    

            if (boxX > ix && boxY == iy) {
                leftBoxes.push(iBox);
            }
        }

        // 找出最近的一块方块
        if (leftBoxes.length > 0) {
            var tempBox = leftBoxes[0];
            for (var i = 0, len = leftBoxes.length; i < len; ++i) {
                if (tempBox.getPositionX() < leftBoxes[i].getPositionX()) {
                    tempBox = leftBoxes[i];
                }
            }
            if (box.value == tempBox.value && isCanCombind) {
                var pos = this._calLeftPos(tempBox, false);
            } else {
                var pos = this._calLeftPos(tempBox, true);
                pos.x += (Global.singleW + Global.buffer);    
            }
        }
        
        return pos;
    },

    _calRightPos: function(box, isCanCombind) {
        var boxX = Math.round(box.getPositionX());
        var boxY = Math.round(box.getPositionY());

        var pos = cc.p(Global.chessboard.right - Global.singleW, boxY);

        // 记下所有在当方块右方的所有方块
        var rightBoxes = [];
        for (var i = 0, len = this.boxes.length; i < len; ++i) {
            var iBox = this.boxes[i];
            var ix = Math.round(iBox.getPositionX());
            var iy = Math.round(iBox.getPositionY());    

            if (boxX < ix && boxY == iy) {
                rightBoxes.push(iBox);
            }
        }

        // 找出最近的一块方块
        if (rightBoxes.length > 0) {
            var tempBox = rightBoxes[0];
            for (var i = 0, len = rightBoxes.length; i < len; ++i) {
                if (tempBox.getPositionX() > rightBoxes[i].getPositionX()) {
                    tempBox = rightBoxes[i];
                }
            }
            if (box.value == tempBox.value && isCanCombind) {
                var pos = this._calRightPos(tempBox, false);
            } else {
                var pos = this._calRightPos(tempBox, true);
                pos.x -= (Global.singleW + Global.buffer);    
            }
        }
        
        return pos;
    },

    _isFull: function(box) {
        var flag = false;
        this.boxes.map(function(item) {
            if (Math.round(item.getPositionX()) == box.pos.x 
                && Math.round(item.getPositionY()) == box.pos.y) {
                flag = true;
            }
        });
        return flag;
    }
});

Chessboard.create = function () {
    var sg = new Chessboard();
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};

Chessboard.scene = function () {
    var scene = cc.Scene.create();
    var layer = Chessboard.create();
    scene.addChild(layer);
    return scene;
};
