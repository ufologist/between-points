between-points
==============
v1.0.0 2013-9-16

通过点击Highcharts X-Y轴系列图形(如line, area, column, bar)上的点来获取差值, 以连接线的形式来展现他们的关系.


支持图形
--------------
1. line
2. area
3. column
4. inverted line, area, column
5. bar


使用效果
--------------
![between-points使用效果](http://ufologist.github.io/between-points/images/between-points-example.png)


使用示例
--------------
    <!doctype html>
    <html lang="en">
    <head>
        <title>基于Highcharts绘制差值连接线的示例</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
        .example {
            height: 400px;
            margin: 0 auto;
        }
        </style>
    </head>
    <body>
        <h1>基于Highcharts绘制差值连接线的示例</h1>
        <h2>column chart example</h2>
        <div id="column-example" class="example"></div>
    
        <script src="http://lib.sinaapp.com/js/jquery/1.8.2/jquery.min.js"></script>
        <script src="http://code.highcharts.com/highcharts.js"></script>
    
        <script src="https://raw.github.com/ufologist/between-points/master/highcharts.between-points.js"></script>
    
        <script>
        var betweenPoints = new Highcharts.BetweenPoints();
    
        $('#column-example').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Browser market share, April, 2011'
            },
            xAxis: {
                categories: ['MSIE', 'Firefox', 'Chrome', 'Safari', 'Opera']
            },
            yAxis: {
                title: {
                    text: 'Total percent market share'
                }
            },
            plotOptions: {
                column: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function(event) {
                                betweenPoints.between(this); 
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Browser brands',
                data: [40, 30, 11.94, 7.15, 2.14]
            }]
        });
        </script>
    </body>
    </html>


API
--------------
    // 1. 选择一种画差值线的模式(竖向和横向)
    var direction = ['portrait', 'landscape'];
    
    // 2. 可选配置项(这里列举的都是默认值)
    var options = {
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
    
    // 3. 新建实例
    var betweenPoints = new Highcharts.BetweenPoints(direction[1], options);
    
    // 4. 一般在图形plotOptions的click方法中调用between即可
    betweenPoints.between(this);


更多示例
--------------
[between-points Example](http://ufologist.github.io/between-points/between-points-example.html)

[example src](https://github.com/ufologist/between-points/tree/master/example)