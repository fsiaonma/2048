var BoxV = cc.LayerColor.extend({
	config: {},

	init: function() {
		if (this._super()) {
			this.value = 0;
			this.width = Global.singleW;
			this.height = Global.singleW;

			this.config = {
				"2": {
					bgColor: cc.color(238, 228, 218, 1000),
					fontColor: cc.color(119, 110, 101, 1000),
					font: "35px Arial"
				},
				"4": {
					bgColor: cc.color(237, 224, 200, 1000),
					fontColor: cc.color(119, 110, 101, 1000),
					font: "35px Arial"
				},
				"8": {
					bgColor: cc.color(242, 177, 121, 1000),
					fontColor: cc.color(246, 246, 242, 1000),
					font: "35px Arial"
				},
				"16": {
					bgColor: cc.color(245, 149, 99, 1000),
					fontColor: cc.color(246, 246, 242, 1000),
					font: "35px Arial"
				},
				"32": {
					bgColor: cc.color(246, 144, 95, 1000),
					fontColor: cc.color(246, 246, 242, 1000),
					font: "35px Arial"
				},
				"64": {
					bgColor: cc.color(246, 94, 59, 1000),
					fontColor: cc.color(246, 246, 242, 1000),
					font: "35px Arial"
				},
				"default": {
					bgColor: cc.color(237, 207, 114, 1000),
					fontColor: cc.color(246, 246, 242, 1000),
					font: "30px Arial"
				}
			}

			var txtW = this.width * 2 / 3;

			var txt = cc.LabelTTF.create("", "", txtW, txtW, cc.TEXT_ALIGNMENT_LEFT);
            txt.setPosition(cc.p(this.width / 2, this.height / 2));
            this.addChild(txt);
            this.txt = txt;

			return true;
		}
		return false;
	},

	move: function(pos, callback) {
		var move = cc.MoveTo.create(0.1, pos);
		var func = cc.CallFunc.create(function() {
			callback && callback();
		}, this);
		var seq = cc.Sequence.create(move, func);
        this.runAction(seq);
	},

	setNum: function(num) {
		this.value = num;
		this.setColor(this.config[num >= 128? "default" : num].bgColor);
		this.txt.setFontFillColor(this.config[num >= 128? "default" : num].fontColor);
		this.txt.font = this.config[num >= 128? "default" : num].font;
		this.txt.setString(num);
	}
});

BoxV.create = function () {
    var sg = new BoxV();
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};

BoxV.scene = function () {
    var scene = cc.Scene.create();
    var layer = BoxV.create();
    scene.addChild(layer);
    return scene;
};