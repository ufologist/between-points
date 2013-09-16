$(function () {
    var betweenPoints = new Highcharts.BetweenPoints('landscape');

    $('#inverted-example').highcharts({
        chart: {
           type: 'area',
           inverted: true // 可用于line, area, column
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
            area: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
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