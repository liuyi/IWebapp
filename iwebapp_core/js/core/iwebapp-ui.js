//IWebUISlider  *****************************************
IWebUISlider.DIRECTION_HORIZON = 1;
IWebUISlider.DIRECTION_VERTICAL = 2;

/**
 *
 * @param target
 * @param opts
 * @constructor
 */
function IWebUISlider(target, opts) {
    // trace(IWebUISlider.arguments[0])
    //trace(target)
    this.container = null;

    this.dragNode = null;
    this.snap = false;
    this.percent = 0;
    this.direction = 1;

    this.supportTransition = getsupportedprop([ 'transition', 'MozTransition', 'WebkitTransition', 'OTransition']);
    this.onChange = null;
    this.min = 0;
    this.max = 1;
    this.value = 0;
    this.increment = 1;
    this.animate = true;
    this.duration = 0.2;

    this._timer = null;
    this.dragOffset = 0;


    if (target != null) {

        this.create(target, opts);
    }


}

IWebUISlider.prototype.create = function (target, opts) {
    this.container = target;


    this.dragNode = Dom.getElementsByClassName(target, "ui-slider-slug")[0];


    this.container.sliderObj = this;
    this.dragNode.sliderObj = this;
    this.dragNode.onFingerMove = this._onTouchMove;
    this.dragNode.onFingerStart = this._onTouchStart;
    this.dragNode.onFingerUp = this._onTouchEnd;

    this.container.onFingerStart = this._onBarClick;
    this.container.onFingerUp = this._onBarUp;


    if (opts != null) {

        this.min = (opts.min != null) ? opts.min : this.min;
        this.max = (opts.max != null) ? opts.max : this.max;
        this.direction = (opts.direction != null) ? opts.direction : this.direction;
        this.onChange = (opts.onChange != null) ? opts.onChange : this.onChange;
        this.animate = (opts.animate != null) ? opts.animate : this.animate;
        this.snap = (opts.snap != null) ? opts.snap : this.snap;
        this.increment = (opts.increment != null) ? opts.increment : this.increment;
        this.dragOffset = (opts.dragOffset != null) ? opts.dragOffset : this.dragOffset;

        if (opts.value != null) {
            this.setVal(opts.value, false);
        } else if (opts.percent != null) {
            this.setPercent(opts.percent, false);
        }
    }


}

IWebUISlider.prototype.destroy = function () {
    clearInterval(this._timer);
    this._timer = null;
    this.container.onFingerStart = null;
    this.container.onFingerUp = null;
    this.container.sliderObj = null;
    this.dragNode.sliderObj = null;
    this.dragNode.onFingerMove = null;
    this.container = null;
    this.activeNode = null;
    this.downNode = null;
    this.dragNode = null;
    this.snap = false;
    this.onChange = null;
    this.dataList = null;

}

IWebUISlider.prototype.setRange = function (min, max) {
    this.min = min;
    this.max = max;
    this.value = this.percent * (this.max - this.min) + this.min;
}

IWebUISlider.prototype.setPercent = function (p, anima) {
    if (p > 1) p = 1;
    if (p < 0) p = 0;


    if (this.snap != true) {
        this.percent = p;
        this.value = this.percent * (this.max - this.min) + this.min;
    } else {

        var val = p * (this.max - this.min) + this.min;
        var n = (val - this.min) / this.increment;

        this.value = Math.round(n) * this.increment + this.min;
        this.percent = (this.value - this.min) / (this.max - this.min);
        if (this.percent > 1) this.percent = 1;
        else if (this.percent < 0) this.percent = 0;
    }


    this._updateDrag(this.percent, anima);


}

IWebUISlider.prototype.setVal = function (val, anima) {
    if (val > this.max) val = this.max;
    else if (val < this.min) val = this.min;


    if (this.snap != true) {
        this.value = val;
    } else {

        var n = (val - this.min) / this.increment;

        this.value = Math.round(n) * this.increment + this.min;
    }


    this.percent = (this.value - this.min) / (this.max - this.min);
    if (this.percent > 1) this.percent = 1;
    else if (this.percent < 0) this.percent = 0;


    this._updateDrag(this.percent, anima);


}


/**********private function list********/

IWebUISlider.prototype._onBarClick = function () {
    var p = 0;
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        p = (this.touchX - this.offsetLeft - this.sliderObj.dragNode.offsetWidth * 0.5) / (this.offsetWidth - this.sliderObj.dragNode.offsetWidth);

    } else {

        p = (this.touchY - this.offsetTop - this.sliderObj.dragNode.offsetHeight * 0.5) / (this.offsetHeight - this.sliderObj.dragNode.offsetHeight);
    }

    if (p < 0) p = 0;
    else if (p > 1) p = 1;

    if (this.sliderObj.snap != true) {
        this.sliderObj._updateData(p);
    }

    this.sliderObj._updateDrag(p);
}


IWebUISlider.prototype._onBarUp = function () {

    if (this.sliderObj.snap != true) return;

    var p = 0;
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        p = (this.touchX - this.offsetLeft - this.sliderObj.dragNode.offsetWidth * 0.5) / (this.offsetWidth - this.sliderObj.dragNode.offsetWidth);

    } else {

        p = (this.touchY - this.offsetTop - this.sliderObj.dragNode.offsetHeight * 0.5) / (this.offsetHeight - this.sliderObj.dragNode.offsetHeight);
    }


    if (p < 0) p = 0;
    else if (p > 1) p = 1;
    var val = this.sliderObj.min + p * (this.sliderObj.max - this.sliderObj.min);
    var n = (val - this.sliderObj.min) / this.sliderObj.increment;

    var val2 = Math.round(n) * this.sliderObj.increment + this.sliderObj.min;


    this.sliderObj.setVal(val2);
    if (this.onChange != null) this.onChange(this.sliderObj.percent, this.sliderObj.value);

}


IWebUISlider.prototype._updateDrag = function (p, anima) {
    var t = (this.animate == false || anima == false) ? 0 : this.duration;

    IWPTween.killOf(this.dragNode);
    if (this.direction == IWebUISlider.DIRECTION_HORIZON) {

        this.dragNode.pos = p * (this.container.offsetWidth + (this.dragOffset * 2) - this.dragNode.offsetWidth);

        // trace(this.container.className)
        //trace("this.dragNode.pos:"+this.dragNode.pos+"  p:"+p+", this.container.offsetWidth:"+this.container.offsetWidth+", this.dragNode.offsetWidth:"+this.dragNode.offsetWidth+", "+this.dragNode.offsetWidth+"  , id:"+this.container.id)

        IWPTween.to(this.dragNode, t, {css: {x: (this.dragNode.pos - this.dragOffset ) + "px"}})


    } else {
        this.dragNode.pos = p * (this.container.offsetHeight + (this.dragOffset * 2) - this.dragNode.offsetHeight);
        IWPTween.to(this.dragNode, t, {css: {y: (this.dragNode.pos - this.dragOffset) + "px"}})

    }
}


IWebUISlider.prototype._onTouchStart = function (x, y) {

    this.style[this.sliderObj.supportTransition] = "0s";
    IWPTween.killOf(this);
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        this.prevPos = this.touchX;
    } else {
        this.prevPos = this.touchY;
    }


}
IWebUISlider.prototype._onTouchMove = function (x, y) {

    if (this.pos == null) {

        this.pos = -this.sliderObj.dragOffset;
    }


    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {

        this.pos = this.pos + this.touchXMov - this.prevPos;
        //  trace("pos1:"+this.pos+" this.touchXMov:"+this.touchXMov+" this.prevPos:"+this.prevPos);
        //if (this.pos < 0) this.pos = 0;
        if (this.pos < -this.sliderObj.dragOffset) {
            this.pos = -this.sliderObj.dragOffset;
        } else if (this.pos >= (this.sliderObj.container.offsetWidth + (this.sliderObj.dragOffset * 2) - this.offsetWidth)) {
            this.pos = this.sliderObj.container.offsetWidth + (this.sliderObj.dragOffset * 2) - this.offsetWidth

        }
        // trace("pos:"+this.pos);

        // this.style.left=this.pos+"px"

        IWPTween.to(this, 0, {css: {x: this.pos + "px"}});
        this.prevPos = this.touchXMov;

        if (this.sliderObj.snap != true)
            this.sliderObj._updateData(this.pos / (this.sliderObj.container.offsetWidth + (this.sliderObj.dragOffset * 2) - this.offsetWidth));

    } else {
        this.pos = this.pos + this.touchYMov - this.prevPos;

        if (this.pos < -this.sliderObj.dragOffset) {
            this.pos = -this.sliderObj.dragOffset;
        } else if (this.pos >= (this.sliderObj.container.offsetHeight + (this.sliderObj.dragOffset * 2) - this.offsetHeight)) {
            this.pos = this.sliderObj.container.offsetHeight + (this.sliderObj.dragOffset * 2) - this.offsetHeight
        }


        IWPTween.to(this, 0, {css: {y: this.pos + "px"}});

        this.prevPos = this.touchYMov;

        if (this.sliderObj.snap != true)
            this.sliderObj._updateData(this.pos / (this.sliderObj.container.offsetHeight + (this.sliderObj.dragOffset * 2) - this.offsetHeight));
    }


}

IWebUISlider.prototype._onTouchEnd = function () {

    if (this.sliderObj.snap == true) {
        //snap drag node to the best position
        if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
            var p = this.pos / (this.sliderObj.container.offsetWidth - this.offsetWidth);


        } else {
            p = this.pos / (this.sliderObj.container.offsetHeight - this.offsetHeight);
        }

        if (p < 0) p = 0;
        else if (p > 1) p = 1;
        var val = this.sliderObj.min + p * (this.sliderObj.max - this.sliderObj.min);
        var n = (val - this.sliderObj.min) / this.sliderObj.increment;

        var val2 = Math.round(n) * this.sliderObj.increment + this.sliderObj.min;

        this.sliderObj.setVal(val2);
        if (this.onChange != null) this.onChange(this.percent, this.value);
    }
}
IWebUISlider.prototype._updateData = function (p) {
    if (p < 0) p = 0;
    else if (p > 1) p = 1;

    this.percent = p;
    this.value = this.percent * (this.max - this.min) + this.min;
    if (this.onChange != null) this.onChange(this.percent, this.value);

}


//IWebUISwitch  *****************************************
IWebapp.extend(IWebUISwitch, IWebUISlider);

/**
 *
 * @param target
 * @param opts
 * @constructor
 */
function IWebUISwitch(target, opts) {
    if (opts == null) opts = {}
    opts.snap = true;
    opts.increment = 100;
    opts.animate = true;
    opts.max = 100;
    opts.min = 0;

    this.activeNode = null;
    this.downNode = null;
    this.activeNode = Dom.getElementsByClassName(target, "ui-slider-active")[0];
    this.downNode = Dom.getElementsByClassName(target, "ui-slider-down")[0];

    IWebUISwitch.$super(this, target, opts);


}

IWebUISwitch.prototype.create = function (target, opts) {
    IWebUISwitch.method(this, "create", target, opts);
    this.activeNode = Dom.getElementsByClassName(target, "ui-slider-active")[0];
    this.downNode = Dom.getElementsByClassName(target, "ui-slider-down")[0];

}


IWebUISwitch.prototype.isOn = function () {
    return this.percent == 1
}

IWebUISwitch.prototype.toggle = function () {
    if (this.percent < 1) {
        this.setPercent(1)
    } else {
        this.setPercent(0)
    }

}

IWebUISwitch.prototype.turnOn = function () {
    this.setPercent(1)
}

IWebUISwitch.prototype.turnOff = function () {
    this.setPercent(0)
}

IWebUISwitch.prototype._onTouchMove = function (x, y) {
    IWebUISwitch.method(this, "_onTouchMove", x, y);
    if (this.sliderObj.direction == IWebUISlider.DIRECTION_HORIZON) {
        IWPTween.to(this.sliderObj.activeNode, 0, {css: {x: (this.pos - this.sliderObj.activeNode.offsetWidth + this.offsetWidth * 0.5) + "px"}});
        IWPTween.to(this.sliderObj.downNode, 0, {css: {x: (this.pos + this.offsetWidth * 0.5) + "px"}});
    } else {
        IWPTween.to(this.sliderObj.activeNode, 0, {css: {y: (this.pos - this.sliderObj.activeNode.offsetHeight + this.offsetHeight * 0.5) + "px"}});
        IWPTween.to(this.sliderObj.downNode, 0, {css: {y: (this.pos + this.offsetHeight * 0.5) + "px"}});
    }
}

IWebUISwitch.prototype._updateDrag = function (p, anim) {
    IWebUISwitch.method(this, "_updateDrag", p, anim);

    IWPTween.killOf(this.activeNode);
    IWPTween.killOf(this.downNode);

    var time = (this.animate == false || anim == false) ? 0 : this.duration;
    if (this.direction == IWebUISlider.DIRECTION_HORIZON) {
        IWPTween.to(this.activeNode, time, {css: {x: (this.dragNode.pos - this.activeNode.offsetWidth - this.dragOffset + this.dragNode.offsetWidth * 0.5) + "px"}});
        IWPTween.to(this.downNode, time, {css: {x: (this.dragNode.pos + this.dragNode.offsetWidth * 0.5) + "px"}});
    } else {
        IWPTween.to(this.activeNode, time, {css: {y: (this.dragNode.pos - this.activeNode.offsetHeight - this.dragOffset + this.dragNode.offsetHeight * 0.5) + "px"}});
        IWPTween.to(this.downNode, time, {css: {y: (this.dragNode.pos + this.dragNode.offsetHeight * 0.5) + "px"}});
    }

}


IWebUISwitch.prototype._onTouchStart = function (x, y) {


    IWPTween.killOf(this.sliderObj.activeNode);
    IWPTween.killOf(this.sliderObj.downNode);
    IWebUISwitch.method(this, "_onTouchStart", x, y);


}

IWebUISwitch.prototype.destroy = function () {
    this.activeNode = null;
    this.downNode = null;
    IWebUISwitch.method(this, "destroy");

}


//IWebUICheckBox *****************************************
/**
 *
 * @param target
 * @param opts
 * @constructor
 */
function IWebUICheckBox(target, opts) {
    this.group = null;
    this.value = null;
    this.selected = false;
    this.container = null;
    this.label = null;
    this.icon = null;

    if (target != null) {
        this.create(target, opts);
    }

}


IWebUICheckBox.prototype.create = function (target, opts) {
    this.container = target;
    this.label = Dom.getElementsByClassName(target, "ui-label")[0];
    this.icon = Dom.getElementsByClassName(target, "ui-icon")[0];

    Dom.addClass(target, "touchable")
    if (opts != null) {
        this.value = (opts.value != null) ? opts.value : null;
        if (opts.text != null && this.label != null) {
            this.label.innerHTML = opts.text;
        }

        if (opts.selected != null) {
            this.setSelect(opts.selected)
        }
    }

    var checkbox = this;
    this.container.onTap = function () {
        checkbox.toggle();
    }

}

IWebUICheckBox.prototype.setSelect = function (selected) {
    this.selected = selected;
    if (this.selected) {
        Dom.addClass(this.container, "selected");
    } else {
        Dom.removeClass(this.container, "selected");
    }

}

IWebUICheckBox.prototype.toggle = function () {
    if (this.selected == true) {
        this.setSelect(false);
    } else {
        this.setSelect(true);
    }
}

IWebUICheckBox.prototype.destroy = function () {
    this.container.onTap = null;
    this.container = null;
    this.label = null;
    this.icon = null;
}


//IWebUICheckBox end*****************************************


function IWebUIRadioBox(target, opts) {
    this.group = null;
    this.value = null;
    this.selected = false;
    this.container = null;
    this.label = null;
    this.icon = null;
    this.index = -1;

    if (target != null) {
        this.create(target, opts);
    }
}


IWebUIRadioBox.prototype.create = function (target, opts) {
    this.container = target;
    this.label = Dom.getElementsByClassName(target, "ui-label")[0];
    this.icon = Dom.getElementsByClassName(target, "ui-icon")[0];
    Dom.addClass(target, "touchable")


    if (opts != null) {
        this.value = (opts.value != null) ? opts.value : null;
        if (opts.text != null && this.label != null) {
            this.label.innerHTML = opts.text;
        }

        if (opts.group != null) {
            this.group = opts.group;
        }

        if (opts.index != null) this.index = opts.index

        if (opts.selected != null) {
            this.setSelect(opts.selected)
        }


    }

    var radio = this;
    this.container.onTap = function () {
        if (radio.selected == false) {

            radio.setSelect(true);
        }

    }
}

IWebUIRadioBox.destroy = function () {
    this.container.onTap = null;
    this.container = null;
    this.label = null;
    this.icon = null;

}

IWebUIRadioBox.prototype.setSelect = function (selected) {
    this.selected = selected;
    if (this.selected) {
        Dom.addClass(this.container, "selected");
    } else {
        Dom.removeClass(this.container, "selected");
    }

    if (this.group != null && this.selected == true) {
        this.group._onSelect(this.index);
    }

}


function IWebUIRadioGroup(target, opts) {
    this.container = null;
    this.radios = null;
    this.radioName = "ui-radio";
    this.data = null;
    this.selected = null;
    this.value = null;

    if (target != null) {
        this.create(target, opts);
    }
}


IWebUIRadioGroup.prototype.create = function (target, opts) {
    this.container = target;
    if (opts) {
        if (opts.data != null) this.data = opts.data;
        if (opts.radioName != null) this.radioName = opts.radioName;

    }


    var views = Dom.getElementsByClassName(this.container, this.radioName);
    this.radios = [];
    for (var i = 0; i < views.length; i++) {
        this.radios.push(new IWebUIRadioBox(views[i], {index: i, group: this}));

    }

    if (opts != null && opts.selected != null) {
        this.radios[opts.selected].setSelect(true);
    }

}

IWebUIRadioGroup.prototype._onSelect = function (index) {
    for (var i = 0; i < this.radios.length; i++) {
        if (i != index) {
            this.radios[i].setSelect(false);
        } else {
            if (this.data != null) {
                this.value = this.data[i];
            }

        }
    }


}

IWebUIRadioGroup.destroy = function () {
    for (var i = 0; i < this.radios.length; i++) {
        this.radios[i].destroy();
        this.radios[i] = null;
    }


    this.container = null;
    this.radios = null;
    this.values = null;
    this.selected = null;
    this.value = null;

}


function IWebUIDropButton(target, opts) {
    this.container = null;
    this.button = null;
    this.itemsContainer = null;
    this.items = null;
    this.selectedItem = null;
    this.data = null;
    this.value = null;
    this.isOpen = false;
    this.onChange = null;
    this.replaceLabelEnable = true;
    this.iscroller = null;
    this.scrollWrapper = null;
    this.touchEvt = (IWebapp.touchable) ? "touchstart" : "mousedown";

    if (target != null) {
        this.create(target, opts);
    }

}


IWebUIDropButton.prototype.create = function (target, opts, render) {

    if (render != false) {
        var text = [];
        if (Dom.hasClass(target, "ui-dropbutton") == false) {
            this.container = window.document.createElement("div");
            this.container.className = "ui-dropbutton";
            target.appendChild(this.container);
        } else {
            this.container = target;
        }

        if (opts != null && opts.buttonOpts != null) {
            this.button = new IWebUIButton(this.container, opts.buttonOpts);
        } else {
            this.button = new IWebUIButton(this.container);
        }


    } else {
        this.container = target;
        if (opts != null && opts.buttonOpts != null) {
            this.button = new IWebUIButton(Dom.getElementsByClassName(this.container, "ui-button")[0], opts.buttonOpts);
        } else {
            this.button = new IWebUIButton(Dom.getElementsByClassName(this.container, "ui-button")[0]);
        }

    }


    this.itemsContainer = window.document.createElement("ul");
    this.itemsContainer.className = "ui-list";
    if (opts != null) {
        this.data = (opts.data != null) ? opts.data : this.data;

        if (opts.value != null) {

        }
        if (opts.selected != null) {

        }
    }

    if (this.scrollWrapper == null) {
        this.scrollWrapper = window.document.createElement("div");
        //this.scrollWrapper.className="scrollWrapper ui-dropbutton-scrollWrapper";
    }

    this._updateItems(opts.data);


    var dropbutton = this;
    this.button.container.onTap = function () {


        dropbutton.toogle();
    }

    addEvent(this.itemsContainer, "tap", this._onItemTap, this)


}
IWebUIDropButton.prototype._onItemTap = function (e, context) {
    var target = e.target || e.srcElement;
    var item = null;
    var selectItem = null;
    var index = -1;
    for (var i = 0; i < context.itemsContainer.childNodes.length; i++) {
        item = context.itemsContainer.childNodes[i].childNodes[0];

        // trace(item)
        if (target == item) {
            index = i;
            selectItem = item;
            break
        }


    }
    // trace(target)
    if (selectItem != null) {
        // trace("you clicked a item:"+selectItem.text);
        context.selectedItem = context.items[index];
        context.value = (context.data[index] != null ) ? context.data[index].value : null;
        context.close();

        trace(context.value)

        if (context.replaceLabelEnable == true) {
            var text = (context.data[index] == null || context.data[index].text == null) ? "" : context.data[index].text;
            context.button.setLabel(text);
            trace("dddddddddd:" + text);
            trace(context.button);
        }

    }
}

IWebUIDropButton.prototype.toogle = function () {

    if (this.itemsContainer.parentNode != null) {
        this.close();

    } else {
        this.open();
    }


}

IWebUIDropButton.prototype.close = function () {
    if (this.itemsContainer.parentNode == null) return;
    this.isOpen = false;
    this.itemsContainer.parentNode.removeChild(this.itemsContainer)

}


IWebUIDropButton.prototype.open = function () {
    if (this.itemsContainer.parentNode != null)  return;

    if (IWebapp.SCREEN_TYPE <= IWebapp.SCREEN_TYPE_SMALL) {
        this._openInSmallScreen();
    } else {
        this._openInSmallScreen();
    }

    this.isOpen = true;
    var context = this;

    addEvent(window.document.body, this.touchEvt, function (e) {
        context._onBodyTap(e)
    })


    addEvent(window.document.body, "mousewheel", function (e) {
        context._onBodyTap(e)
    })
}

IWebUIDropButton.prototype._openInSmallScreen = function () {


    var pageHeight = Dom.getPageSize().pageHeight;
    this.scrollWrapper.appendChild(this.itemsContainer)
    window.document.body.appendChild(this.scrollWrapper);
    trace("page height:" + this.itemsContainer.offsetHeight+"/"+pageHeight)
    if (this.itemsContainer.offsetHeight < pageHeight) {
        Dom.removeClass(this.scrollWrapper, "scrollWrapper")
        Dom.removeClass(this.scrollWrapper, "ui-dropbutton-scrollWrapper")
        this.scrollWrapper.style.top = "50%";
        this.scrollWrapper.style.marginTop = -this.itemsContainer.offsetHeight * 0.5 + "px";

        if( this.iscroller!=null){
            this.iscroller.disable()
        }
    } else {
        //add iscroll
        trace("iscoll"+this.iscroller);
        this.scrollWrapper.className = "scrollWrapper ui-dropbutton-scrollWrapper";
        if (this.iscroller == null) {

            this.iscroller = CreateScroller(this.scrollWrapper);
        }else{
            this.iscroller.enable()
        }




    }


    this.scrollWrapper.style.left = "50%";
    this.scrollWrapper.style.position="absolute"
    this.scrollWrapper.style.width=this.button.container.offsetWidth+"px";
    this.scrollWrapper.style.marginLeft = -this.itemsContainer.offsetWidth * 0.5 + "px";


}

IWebUIDropButton.prototype._openInNormalScreen = function () {
    window.document.body.appendChild(this.itemsContainer);


    var pos = Dom.getPosition(this.container);
    var height = Dom.getPageSize().pageHeight - pos.y - this.button.container.offsetHeight;

    if (height < this.itemsContainer.offsetHeight) {

        this.itemsContainer.style.top = (pos.y - this.itemsContainer.offsetHeight) + "px"
    } else {
        this.itemsContainer.style.top = (pos.y + this.container.offsetHeight) + "px";

    }
    this.itemsContainer.style.left = pos.x + "px";


}

IWebUIDropButton.prototype._onBodyTap = function (e) {

    var target = e.target || e.srcElement;


    var parent = target;
    var isOut = true;
    while (parent) {
        if (parent == this.itemsContainer || parent == this.container || parent == this.button.container) {
            isOut = false;
            parent = null;
            break;
        } else {
            parent = parent.parentNode;
        }
    }


    if (isOut) {
        this.close();
    }

}


/**
 * data format:[{text:text,value:value}]
 * @param data
 * @private
 */
IWebUIDropButton.prototype._updateItems = function (data) {
    if (data == null) return;
    var item = null;
    var clip = null;
    var obj = IWebUI.getView("ui-list");
    this.items = [];
    for (var i = 0; i < data.length; i++) {
        clip = data[i];
        this.itemsContainer.innerHTML += obj.itemWrapper;
        item = new IWebUIButton(this.itemsContainer.childNodes[i], {text: clip.text});
        this.items[i] = item;
    }

}

function IWebUIButton(target, opts, render) {
    this.container = null;
    this.label = null;
    this.icon = null;

    if (target != null) {
        this.create(target, opts, render);
    }
}

IWebUIButton.prototype.create = function (target, opts, render) {

    if (render != false) {
        var obj = IWebUI.getView("button");
        var text = [];
        if (Dom.hasClass(target, "ui-button") == false) {

            this.container = window.document.createElement("a");
            this.container.className = "ui-button";
            target.appendChild(this.container);


        } else {
            this.container = target;
        }

        if (opts != null && opts.icon) {
            text.push(obj.icon);
        }

        text.push(obj.label);
        this.container.innerHTML = text.join("")
        text = null;

    } else {
        this.container = target;

    }

    this.label = Dom.getElementsByClassName(this.container, "ui-label")[0];

    this.icon = Dom.getElementsByClassName(this.container, "ui-icon")[0];


    if (opts != null) {
        if (opts.text != null) {
            this.setLabel(opts.text);
            //  this.label.innerHTML = opts.text;
        }


        if (this.icon != null) {
            Dom.addClass(this.icon, "ui-icon-" + opts.icon)
        }

        if (opts.onTap != null) {
            this.container.onTap = opts.onTap;
        }


        if (opts.onLongTap != null) {
            this.container.onLongTap = opts.onLongTap;
            this.container.setAttribute("longtap", "true")
        }

    }

}

IWebUIButton.prototype.setLabel = function (text) {
    this.label.innerHTML = text;
}

IWebUIButton.prototype.disable = function () {
    this.container.addClass("disabled")
}


function IWebUI() {

}

IWebUI.views = {};
IWebUI.views["button"] = {root: "<a class='ui-button'></a>", icon: "<span class='ui-icon'></span>", label: "<span class='ui-label'></span>"};

IWebUI.views["dropbutton"] = {root: "<ul class='ui-dropbutton'></ul>", item: "<li class='ui-item'></li>"}

IWebUI.views["ui-list"] = {root: "<ul class='ui-list'></ul>", itemWrapper: "<li class='ui-list-item ui-dropbutton-list-item' tabindex='0'></li>"}
IWebUI.getView = function (type) {
    return IWebUI.views[type];
}


function CreateScroller(scrollTarget, opts) {
    //we only need one scroll.
    //if(myScroll!=null) {myScroll.destory();}
    var bounce = true;
    var hScroll = false;
    var vScroll = true;
    var snap = false;
    var snapThreshold = 110;
    var momentum = true;
    var bounceLock = false;

    var onScrollEnd = null;

    if (opts != null && opts.bounce != null) {
        bounce = opts.bounce;
    }
    if (opts != null && opts.bounceLock != null) {
        bounce = opts.bounceLock;
    }

    if (opts != null && opts.hScroll != null) {
        hScroll = opts.hScroll;
    }

    if (opts != null && opts.vScroll != null) {
        vScroll = opts.vScroll;
    }

    if (opts != null && opts.snapThreshold != null) {
        snap = opts.snapThreshold;
    }
    if (opts != null && opts.snap != null) {
        snap = opts.snap;
    }

    if (opts != null && opts.momentum != null) {
        momentum = opts.momentum;
    }

    if (opts != null && opts.onScrollEnd != null) {
        onScrollEnd = opts.onScrollEnd;
    }


    return  new iScroll(scrollTarget, {


        onBeforeScrollStart: function (e) {

            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;
            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();

        },
        hScrollbar: false,
        vScrollbar: false,
        zoom: false,
        bounce: bounce,
        bounceLock: bounceLock,
        snap: snap,
        snapThreshold: snapThreshold,
        momentum: momentum,
        handleClick: false,
        hScroll: hScroll,
        vScroll: vScroll,
        onScrollEnd: onScrollEnd

    });


}