$(function() {
    var betweenPoints = new Highcharts.BetweenPoints('landscape', {
        higherPointOffset: 20,
        textOffset: 5,
        decimalDigits: 4,
        directionDecorationOffset: 5,
        lineAttr: {
            // http://jsfiddle.net/highcharts/cSrgA/14/
            dashstyle: 'shortdashdot'
        },
        lineCss: {
            stroke: '#600'
        },
        textAttr: {
            fill: '#999',
            stroke: '#000'
        },
        textCss: {
            'font-style': 'italic'
        }
    });

    $('#full-options-example').highcharts({
        chart: {
            type: 'bar'
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
            bar: {
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
});