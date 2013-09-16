/**
 * 通过点击Highcharts X-Y轴系列图形(如line, area, column, bar)上的点来获取差值,
 * 以连接线的形式来展现他们的关系.
 * 
 * 交互的效果如下(以柱状图为例):
 * 1. 先点击一个柱子为源点
 * 2. 再点击一个柱子为目标点
 * 3. 比较2个点的值
 * 4. 绘制出源点到目标点的连接线, 并在连接线中心位置放置差值
 * 
 * 对于X-Y轴图形有2种模式, 竖向模式(通常是这个)/横向模式
 * 他们的X-Y轴方向恰好相反.
 * 
 * ^
 * |   o--差值--o
 * |   |        |
 * |  ___       |
 * |  | |       |
 * |  | |      _v_
 * |  | |      | |
 * |  | |      | |
 * +------------------->
 * 此为竖向模式, 例如line, area, column chart
 *
 * 
 * |
 * |---------|
 * |         <---------o
 * |---------|         |
 * |                   |
 * |                 差值
 * |                   |
 * |----------------|  |
 * |                |--o
 * |----------------|
 * |
 * v------------------------->
 * 此为横向模式, 例如bar chart, inverted line, area, column chart
 *
 * 
 * 使用方法
 * ---------------------------
 * 最少配置项
 * var betweenPoints = new Highcharts.BetweenPoints();
 * 
 * $('#line-example').highcharts({
 *     title: {
 *         text: 'Browser market share, April, 2011'
 *     },
 *     xAxis: {
 *         categories: ['MSIE', 'Firefox', 'Chrome', 'Safari', 'Opera']
 *     },
 *     yAxis: {
 *         title: {
 *             text: 'Total percent market share'
 *         }
 *     },
 *     plotOptions: {
 *         line: {
 *             cursor: 'pointer',
 *             point: {
 *                 events: {
 *                     click: function() {
 *                         betweenPoints.between(this);
 *                     }
 *                 }
 *             }
 *         }
 *     },
 *     series: [{
 *         name: 'Browser brands',
 *         data: [40, 30, 11.94, 7.15, 2.14]
 *     }]
 * });
 *
 * 全部配置项
 * var betweenPoints = new Highcharts.BetweenPoints('landscape', {
 *     higherPointOffset: 20,
 *     textOffset: 5,
 *     decimalDigits: 4,
 *     directionDecorationOffset: 5,
 *     lineAttr: {
 *         // http://jsfiddle.net/highcharts/cSrgA/14/
 *         dashstyle: 'shortdashdot'
 *     },
 *     lineCss: {
 *         stroke: '#600'
 *     },
 *     textAttr: {
 *         fill: '#999',
 *         stroke: '#000'
 *     },
 *     textCss: {
 *         'font-style': 'italic'
 *     }
 * });
 * 
 * $('#full-options-example').highcharts({
 *     chart: {
 *         type: 'bar'
 *     },
 *     title: {
 *         text: 'Browser market share, April, 2011'
 *     },
 *     xAxis: {
 *         categories: ['MSIE', 'Firefox', 'Chrome', 'Safari', 'Opera']
 *     },
 *     yAxis: {
 *         title: {
 *             text: 'Total percent market share'
 *         }
 *     },
 *     plotOptions: {
 *         bar: {
 *             cursor: 'pointer',
 *             point: {
 *                 events: {
 *                     click: function(event) {
 *                         betweenPoints.between(this); 
 *                     }
 *                 }
 *             }
 *         }
 *     },
 *     series: [{
 *         name: 'Browser brands',
 *         data: [40, 30, 11.94, 7.15, 2.14]
 *     }]
 * });
 *
 * @author Sun http://ufologist.github.io/between-points/
 * @version 2013-9-16 1.0.0
 */

// Extending Highcharts
// http://www.highcharts.com/docs/extending-highcharts
;(function(H) {
    function BetweenPoints(direction, options) {
        var _instance = null;
        if (direction === 'landscape') {
            _instance = new HighchartLandscapeBetweenPoints(options);
        } else {
            _instance = new HighchartPortraitBetweenPoints(options);
        }

        this.instance = _instance;
    }
    BetweenPoints.prototype.between = function(point) {
        this.instance.between(point);
    };
    H.BetweenPoints = BetweenPoints;


    /**
     * 用于绘制差值连接线的抽象类
     * 
     * @param {Object} options 可选配置参数, 请参考HighchartBetweenPoints.defaults
     * @see <a href="http://jsfiddle.net/gh/get/jquery/1.7.1/highslide-software/highcharts.com/tree/master/samples/highcharts/members/renderer-on-chart/">Annotating a chart programmatically</a>
     * @see http://www.highcharts.com/demo/renderer
     */
    function HighchartBetweenPoints(options) {
        this._options = $.extend(true, {}, HighchartBetweenPoints.defaults, options);

        // 需要对比值的2个点, 分别为源点和目标点
        this.sourcePoint = null;
        this.targetPoint = null;
        // 源点和目标点的位置
        this.sourcePointX = 0;
        this.sourcePointY = 0;
        this.targetPointX = 0;
        this.targetPointY = 0;

        // 绘制连接线所需的4个关键点
        //
        // 1. 较高点的位置(A), 已知
        // 2. 较高点向上延长的位置(B), 通过一定的偏移常量(X)计算得出
        // 3. 较低点的位置(C), 已知
        // 4. 较低点向上延长的位置(D), 与B点齐平
        // 
        // ^
        // |   B--差值--C
        // |   |        |
        // |  _A_       |
        // |  | |       |
        // |  | |      _D_
        // |  | |      | |
        // |  | |      | |
        // +------------------->
        // A点
        this.higherPointX = 0;
        this.higherPointY = 0;
        // D点
        this.lowerPointX = 0;
        this.lowerPointY = 0;
        // B点
        this.higherLineEndX = 0;
        this.higherLineEndY = 0;
        // C点
        this.lowerLineEndX = 0;
        this.lowerLineEndY = 0;

        // 渲染引擎, 用于绘制元素
        this.renderer = null;
        // 差值
        this.value = 0;

        // 记录绘制过的元素, 方便清理
        this.drawElements = [];
    }

    HighchartBetweenPoints.defaults = {
        higherPointOffset: 20,        // 最高点延长线的偏移量
        textOffset: 5,                // 差值文本的偏移量
        decimalDigits: 2,             // 差值需要保留的小数位
        directionDecorationOffset: 5, // 绘制方向装饰物的偏移量
        lineAttr: {                   // 连接线(包括方向装饰物)的属性
            'stroke-width': 2,
            stroke: 'black',
            dashstyle: 'dash',
            opacity: 0.9
        },
        lineCss: {},                  // 连接线(包括方向装饰物)的样式
        textAttr: {},                 // 差值文本的属性
        textCss: {                    // 差值文本的样式
            'font-weight': 'bold'
        }
    };

    /**
     * 进行差值比较
     * 
     * @param {Point} point Highcharts的Point对象
     */
    HighchartBetweenPoints.prototype.between = function(point) {
        if (this.init(point)) {
            this.initSourceTargetPoints();
            this.initHigherLowerPoints();
            this.initBetweenLinePoints();

            this.drawCable();
            this.drawValueText();
            this.drawDirectionDecoration();
        }
    };

    /**
     * 清除差值比较
     */
    HighchartBetweenPoints.prototype.clear = function() {
        this.sourcePoint.select(false);
        this.targetPoint.select(false);
        this.sourcePoint = null;
        this.targetPoint = null;

        for (var i = 0, length = this.drawElements.length; i < length; i++) {
            this.drawElements.pop().destroy();
        }
    };

    HighchartBetweenPoints.prototype.init = function(point) {
        // 如果绘制过了, 则重新开始
        if (this.drawElements.length > 0) {
            this.clear();
        }

        if (!this.sourcePoint) {
            this.sourcePoint = point;
            this.sourcePoint.select(true, true);
        } else if (this.sourcePoint == point) { // 不允许源点/目标点是同一个
            this.sourcePoint.select(false);
            this.sourcePoint = null;
        } else {
            this.targetPoint = point;
            this.targetPoint.select(true, true);
        }

        if (this.sourcePoint && this.targetPoint) {
            // XXX API中没有公开获取chart renderer的方法
            this.renderer = point.series.chart.renderer;
            this.value = this.sourcePoint.y - this.targetPoint.y;
            return true;
        }
        return false;
    };

    /**
     * 子类实现计算出源点和目标点位于chart内容区域(SVG的区域)的哪个位置
     */
    HighchartBetweenPoints.prototype.initSourceTargetPoints = function() {};

    /**
     * 初始化较高点和较低点的位置
     */
    HighchartBetweenPoints.prototype.initHigherLowerPoints = function() {
        // 计算出哪个点才是较高点
        if (this.sourcePoint.y > this.targetPoint.y) {
            this.higherPointX = this.sourcePointX;
            this.higherPointY = this.sourcePointY;
            this.lowerPointX = this.targetPointX;
            this.lowerPointY = this.targetPointY;
        } else {
            this.higherPointX = this.targetPointX;
            this.higherPointY = this.targetPointY;
            this.lowerPointX = this.sourcePointX;
            this.lowerPointY = this.sourcePointY;
        }
    };

    /**
     * 子类实现初始化连接线(即连接延伸出来的那个两根线之间的连接线)上2点的位置
     */
    HighchartBetweenPoints.prototype.initBetweenLinePoints = function() {};

    /**
     * 绘制连接线
     */
    HighchartBetweenPoints.prototype.drawCable = function() {
        var cable = this.renderer.path([
            'M', this.higherPointX, this.higherPointY,
            'L', this.higherLineEndX, this.higherLineEndY,
            'L', this.lowerLineEndX, this.lowerLineEndY,
            'L', this.lowerPointX, this.lowerPointY
        ]).attr(this._options.lineAttr).css(this._options.lineCss)
          .add().toFront();
        this.drawElements.push(cable);
    };

    /**
     * 绘制差值数字
     */
    HighchartBetweenPoints.prototype.drawValueText = function() {
        var text = this.getText();

        // 文本需要绘制在哪个点上
        var textPoint = this.getTextPoint(text);
        var valueText = this.renderer.text(text, textPoint.x, textPoint.y)
                                     .attr(this._options.textAttr).css(this._options.textCss)
                                     .add().toFront();
        this.drawElements.push(valueText);
    };

    /**
     * 获取要绘制的文本
     *
     * @return Text
     */
    HighchartBetweenPoints.prototype.getText = function() {
        // 判断值是否是小数, 如果是小数则保留2位小数位
        // 如果是整数, 则直接显示整数的值, 不要小数位, 避免出现 10.00 这样的值
        var text = '';
        if (HighchartBetweenPoints.isInt(this.value)) {
            text = Highcharts.numberFormat(this.value, 0);
        } else {
            text = Highcharts.numberFormat(this.value, this._options.decimalDigits);
        }
        return text;
    };

    /**
     * 子类实现获取连接线中心点的位置
     *
     * @return {x: 中心点x坐标值, y: 中心点y坐标值}
     */
    HighchartBetweenPoints.prototype.getBetweenLineCenter = function() {};

    /**
     * 子类实现获取文本需要绘制在哪个位置
     * 
     * @param  {String} text
     * @return {Object} {x: 文本x坐标值, y: 文本y坐标值}
     */
    HighchartBetweenPoints.prototype.getTextPoint = function(text) {};

    /**
     * 临时绘制一下文本获取文本的宽度, 这样才能确保文本居中放置在中心点
     * 
     * @param  {String} text
     * @param  {Number} x
     * @param  {Number} y
     * 
     * @return {Number} Get the bounding box of the text
     */
    HighchartBetweenPoints.prototype.getTextBBox = function(text, x, y) {
        var textElement = this.renderer.text(text, x, y)
                                       .attr(this._options.textAttr).css(this._options.textCss)
                                       .add();
        var textBBox = textElement.getBBox();
        textElement.destroy();

        return textBBox;
    };

    /**
     * 子类实现绘制连接线的装饰物, 用于表明连接线(计算差值)的方向
     */
    HighchartBetweenPoints.prototype.drawDirectionDecoration = function() {};

    // http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
    HighchartBetweenPoints.isInt = function(n) {
        return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
    };


    // 子类实现
    /**
     * 竖向的XY轴图形(例如line chart), 绘制差值连接线的子类实现
     * 
     * @param {Object} options 可选配置参数, 请参考HighchartBetweenPoints.defaults
     */
    function HighchartPortraitBetweenPoints(options) {
        // 继承
        HighchartBetweenPoints.call(this, options);
    }
    // 基于原型的继承
    HighchartPortraitBetweenPoints.prototype = new HighchartBetweenPoints();
    HighchartPortraitBetweenPoints.prototype.constructor = HighchartPortraitBetweenPoints;

    // 实现父类中的抽象方法
    /**
     * 计算出源点和目标点位于chart内容区域(SVG的区域)的哪个位置
     *
     *  ^                       +-----X轴----->
     *  |                       |
     *  |                       |
     * Y轴                 =>  Y轴
     *  |                       |
     *  |                       |
     *  +-----X轴------>        v
     *  竖向轴坐标系            绘制区域坐标系
     */
     HighchartPortraitBetweenPoints.prototype.initSourceTargetPoints = function() {
        this.sourcePointX = this.sourcePoint.series.xAxis.toPixels(this.sourcePoint.x);
        this.sourcePointY = this.sourcePoint.series.yAxis.toPixels(this.sourcePoint.y);
        this.targetPointX = this.targetPoint.series.xAxis.toPixels(this.targetPoint.x);
        this.targetPointY = this.targetPoint.series.yAxis.toPixels(this.targetPoint.y);
    };
    HighchartPortraitBetweenPoints.prototype.initBetweenLinePoints = function() {
        this.higherLineEndX = this.higherPointX;
        this.higherLineEndY = this.higherPointY - this._options.higherPointOffset;
        this.lowerLineEndX = this.lowerPointX;
        this.lowerLineEndY = this.higherLineEndY;
    };
    HighchartPortraitBetweenPoints.prototype.getBetweenLineCenter = function() {
        // 判断哪个点更靠近X轴(绘制区域坐标系中的X轴), 以此为基点计算水平连接线的中心点位置
        var leftX = this.sourcePointX < this.targetPointX ? this.sourcePointX : this.targetPointX;

        var x = leftX + Math.abs(this.targetPointX - this.sourcePointX) / 2;
        var y = this.higherLineEndY - this._options.textOffset;

        return {
            x: x,
            y: y
        };
    };
    HighchartPortraitBetweenPoints.prototype.getTextPoint = function(text) {
        // 连接线的中心点
        var betweenLineCenter = this.getBetweenLineCenter();
        var textBBox = this.getTextBBox(text, betweenLineCenter.x, betweenLineCenter.y);

        return {
            x: betweenLineCenter.x - textBBox.width / 2,
            y: betweenLineCenter.y
        };
    };
    HighchartPortraitBetweenPoints.prototype.drawDirectionDecoration = function() {
        // 源点画一小条横线表示起点
        var sourcePointLine = this.renderer.path([
            'M', this.sourcePointX, this.sourcePointY,
            'L', this.sourcePointX - this._options.directionDecorationOffset, this.sourcePointY,
            'M', this.sourcePointX, this.sourcePointY,
            'L', this.sourcePointX + this._options.directionDecorationOffset, this.sourcePointY
        ]).attr(this._options.lineAttr).css(this._options.lineCss)
          .add().toFront();

        // 目标点画出向下的箭头
        var targetPointArrow = this.renderer.path([
            'M', this.targetPointX, this.targetPointY,
            'L', this.targetPointX - this._options.directionDecorationOffset, this.targetPointY - this._options.directionDecorationOffset,
            'M', this.targetPointX, this.targetPointY,
            'L', this.targetPointX + this._options.directionDecorationOffset, this.targetPointY - this._options.directionDecorationOffset
        ]).attr(this._options.lineAttr).css(this._options.lineCss)
          .add().toFront();

        this.drawElements.push(sourcePointLine, targetPointArrow);
    };




    /**
     * 横向的XY轴图形(例如bar chart), 绘制差值连接线的子类实现
     * 
     * @param {Object} options 可选配置参数, 请参考HighchartBetweenPoints.defaults
     */
    function HighchartLandscapeBetweenPoints(options) {
        // 继承
        HighchartBetweenPoints.call(this, options);
    }
    // 基于原型的继承
    HighchartLandscapeBetweenPoints.prototype = new HighchartBetweenPoints();
    HighchartLandscapeBetweenPoints.prototype.constructor = HighchartLandscapeBetweenPoints;

    // 实现父类中的抽象方法
    /**
     * 横向图形(例如bar chart)的XY轴与竖向图形(例如line chart)刚好是相反的
     * 
     *  |                       +-----X轴----->
     *  |                       |
     * X轴                 =>  Y轴
     *  |                       |
     *  |                       |
     *  v-----Y轴------->       v
     *  横向轴坐标系            绘制区域坐标系
     */
    HighchartLandscapeBetweenPoints.prototype.initSourceTargetPoints = function() {
        this.sourcePointX = this.sourcePoint.series.yAxis.toPixels(this.sourcePoint.y);
        this.sourcePointY = this.sourcePoint.series.xAxis.toPixels(this.sourcePoint.x);
        this.targetPointX = this.targetPoint.series.yAxis.toPixels(this.targetPoint.y);
        this.targetPointY = this.targetPoint.series.xAxis.toPixels(this.targetPoint.x);
    };

    HighchartLandscapeBetweenPoints.prototype.initBetweenLinePoints = function() {
        // 计算出连接线的位置
        this.higherLineEndX = this.higherPointX + this._options.higherPointOffset;
        this.higherLineEndY = this.higherPointY;
        this.lowerLineEndX = this.higherLineEndX;
        this.lowerLineEndY = this.lowerPointY;
    };

    HighchartLandscapeBetweenPoints.prototype.getBetweenLineCenter = function() {
        // 判断哪个点更靠近Y轴(绘制区域坐标系中的Y轴), 以此为基点计算垂直连接线的中心点位置
        var topY = this.sourcePointY < this.targetPointY ? this.sourcePointY : this.targetPointY;

        var x = this.higherLineEndX;
        var y = topY + Math.abs(this.sourcePointY - this.targetPointY) / 2;

        return {
            x: x,
            y: y
        };
    };

    HighchartLandscapeBetweenPoints.prototype.getTextPoint = function(text) {
        var betweenLineCenter = this.getBetweenLineCenter();
        var textBBox = this.getTextBBox(text, betweenLineCenter.x, betweenLineCenter.y);

        return {
            x: betweenLineCenter.x - textBBox.width - this._options.textOffset,
            y: betweenLineCenter.y + textBBox.height / 2
        };
    };

    HighchartLandscapeBetweenPoints.prototype.drawDirectionDecoration = function() {
        // 源点画一小条竖线表示起点
        var sourcePointLine = this.renderer.path([
            'M', this.sourcePointX, this.sourcePointY,
            'L', this.sourcePointX, this.sourcePointY - this._options.directionDecorationOffset,
            'M', this.sourcePointX, this.sourcePointY,
            'L', this.sourcePointX, this.sourcePointY + + this._options.directionDecorationOffset
        ]).attr(this._options.lineAttr).css(this._options.lineCss)
          .add().toFront();

        // 目标点画出向左的箭头
        var targetPointArrow = this.renderer.path([
            'M', this.targetPointX, this.targetPointY,
            'L', this.targetPointX + this._options.directionDecorationOffset, this.targetPointY - this._options.directionDecorationOffset,
            'M', this.targetPointX, this.targetPointY,
            'L', this.targetPointX + this._options.directionDecorationOffset, this.targetPointY + this._options.directionDecorationOffset
        ]).attr(this._options.lineAttr).css(this._options.lineCss)
          .add().toFront();

        this.drawElements.push(sourcePointLine, targetPointArrow);
    };
})(Highcharts);