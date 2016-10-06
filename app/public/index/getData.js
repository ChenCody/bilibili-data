/**
 * @author chenqi14
 */

var $ = require('jquery');
var echarts = require('echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');

$('.submit-bt').on('click', function() {
    var val = $('.upid-input').val();
    if(val) {
        console.log('123123');
        getUpData(val);
    }
});

function getUpData(upId, upId2) {
    var isCombate = !!upId2;
    $.when(
        $.ajax(
            {
                url: 'http://bilibili-service.daoapp.io/uservideos/' + upId + '?count=500',
                type: 'get'
            }
        ),
        isCombate && $.ajax(
            {
                url: 'http://bilibili-service.daoapp.io/uservideos/' + upId2 + '?count=500',
                type: 'get'
            }
        )
        )
        .then(function (d1, d2) {
            var data1 = d1[0];
            var data2 = d2[0];
            var videoList1 = [];
            var videoList2 = [];

            data1.vlist.map(function (value) {
                videoList1.push([new Date(value.created), (value.play / 10000).toFixed(2), value.aid, value.title]);
            });

            console.log(data1);
            dataResolve(data1.vlist);

            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('echarts'));
            myChart.setOption({
                title: {
                    text: data1.vlist[0].author,
                    subtext: '播放数统计'
                },
                tooltip: {
                    formatter: function (params) {
                        return 'av'+ params.data[2] +'<br/>视频名称: '+ params.data[3] +'<br/>播放量: ' + params.data[1]
                            + '万<br/>投稿日期: ' + (new Date(params.data[0])).Format('yyyy-MM-dd hh:mm:ss') + '<br/>点击打开视频网页'
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        restore: {show: true},
                        saveAsImage: {show: true}
                    }
                },
                calculable: true,
                xAxis: {
                    type: 'time',
                    splitNumber: 10
                },
                yAxis: [
                    {
                        name: '播放量(万)',
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '1的播放量',
                        type: 'line',
                        showAllSymbol: true,
                        markPoint: {
                            data1: [
                                {type: 'max', name: '最大值'}
                            ]
                        },
                        data: videoList1
                    },
                    {
                        name: '2的播放量',
                        type: 'line',
                        showAllSymbol: true,
                        markPoint: {
                            data1: [
                                {type: 'max', name: '最大值'}
                            ]
                        },
                        data: videoList2
                    }
                ]
            });
            myChart.on('click', function (params) {
                if (params.componentType === 'series') {
                    window.location.href = 'http://www.bilibili.com/video/av' + params.data[2];
                }
            });

        });

}

function dataResolve(data) {
    console.log(data);
    var analysisResult = dataAnalyse(data);
    console.log(analysisResult);
}

function dataAnalyse(data) {
    var totalViewer = 0;
    var postAmount = data.length;
    data.map(function(value) {
        totalViewer += +value.play
    });
    var averageViewer = (totalViewer/postAmount).toFixed(1);

    // 计算高于平均观看量的数量
    var aboveAverageAmount = 0;
    data.map(function(value) {
        if(value.play > averageViewer) {
            aboveAverageAmount++;
        }
    });

    return {
        totalViewer: totalViewer,
        postAmount: postAmount,
        averageViewer: averageViewer,
        aboveAverageRate: aboveAverageAmount/totalViewer
    }
}


Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}