var Fluid = (function(fluid) {

    var spanNode = document.createElement('span'), threadArr = [], _area = 500, _timeout = 5, _changeFlag = false, // 是否切换文件
        newThread = null; // 记录第二线程中，下次将执行的线程

    var config = {
        showClass : 'setH',
        continuous : false
    };

    function initData() {
        spanNode.className = config.showClass || 'setH';
    }

    /* 样式部分 setH, setB */
    function setH(_clone, h) {
        _clone.style.visibility = 'visible';
        _clone.style.height = Math.abs(h) + 'px';
    }
    function setB(_clone, h) {
        _clone.style.visibility = 'visible';
        _clone.innerHTML = h;
        h = Math.abs(h);
        _clone.style.backgroundColor = 'rgb(' + h + ', ' + (255 - h) + ',' + h
            + ')';
    }
    /* 样式部分 */

    function dealPart(from, to, dv) {
        var i = from, j = 0;
        for (; i < to; i++) {
            if (_changeFlag) { // 当改变选择文件时，停止渲染
                break;
            }

            var _clone = spanNode.cloneNode();
            _clone.style.visibility = 'hidden';
            document.getElementById('showIt').appendChild(_clone);

            threadArr.push(setTimeout(eval(config.showClass), _timeout * j,
                _clone, dv.getUint8(i)));
            j++;
        }
    }

    /* 从arr中处理第index部分的数据[from, to] */
    function dealChain(index, dv) {
        var len = dv.byteLength;
        var part = Math.floor(len / _area) + 1;
        var from = (index - 1) * _area, to = index * _area - 1;
        if (index == part) {
            to = len;
        }
        console.log("Display: [" + from + " - " + to + "]");

        // 清空上一部分的数据
        threadArr = [];

        // 是否连续
        if (!config.continuous) {
            document.getElementById('showIt').innerHTML = '';
        }

        dealPart(from, to, dv);

        // 最后一部分后，停止循环
        if (index != part) {
            newThread = setTimeout(dealChain, _area * _timeout, ++index, dv);
        }
    }

    function readAudio(file) {
        _changeFlag = true;

        clearTimeout(newThread);
        newThread = null;

        for (var i = 0; i < threadArr.length; i++) {
            clearTimeout(threadArr[i]);
        }
        threadArr = [];
        document.getElementById('showIt').innerHTML = '';

        // 当清空现有进程，则准许新的文件处理
        _changeFlag = false;

        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function() {
            var dv = new DataView(reader.result);
            console.log(dv.byteLength);
            setTimeout(dealChain, 0, 1, dv);
        };
    }

    // 接口：配置
    fluid.config = function(conf) {
        for ( var s in conf) {
            if (config.hasOwnProperty(s)) {
                config[s] = conf[s];
            }
        }
        initData();
    };

    // 接口：读取操作
    fluid.changeFileRead = function(_this) {
        var fil = _this.files;
        for (var i = 0; i < fil.length; i++) {
            readAudio(fil[i]);
        }
    };

    initData();

    return fluid;

})(Fluid || {});