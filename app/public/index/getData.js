/**
 * @author chenqi14
 */
// TODO 小数点过长的异常(如:川大发 24919529)
$('.submit-bt').on('click', function () {
    var val = $('.upid-input').val();
    if (val) {
        // 禁用按钮
        $('.submit-bt').attr('disabled', 'disabled');

        $('.loading-info').fadeIn(200);
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
            var videoList1 = [];
            $('.loading-info').fadeOut(100);

            //判断是否有误
            var errorPop = $('.error-popout');
            if(!data1.vlist) {
                // 取消禁用图标
                errorPop.html('输入的uid可能有误哦~').fadeIn(100);
                setTimeout(function() {
                    errorPop.fadeOut(100);
                    $('.upid-input').val('');
                    $('.submit-bt').removeAttr('disabled');
                }, 2000);
                return 'error';
            }
            if(data1.vlist.length < 4) {
                // 取消禁用图标
                errorPop.html('改up主投稿数量太少啦~').fadeIn(100);
                setTimeout(function() {
                    errorPop.fadeOut(100);
                    $('.upid-input').val('');
                    $('.submit-bt').removeAttr('disabled');
                }, 2000);
                return '投稿数量太少';
            }

            $('.submit-bt').removeAttr('disabled');


            data1.vlist.map(function (value) {
                videoList1.push([new Date(value.created), (value.play / 10000).toFixed(2), value.aid, value.title]);
            });

            dataResolve(data1.vlist);

            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('echarts'));
            myChart.setOption({
                title: {
                    text: data1.vlist[0].author,
                    subtext: '播放数统计'
                },
                color: ['#00a1d6', '#00a1d6'],
                tooltip: {
                    formatter: function (params) {
                        return 'av' + params.data[2] + '<br/>视频名称: ' + params.data[3] + '<br/>播放量: ' + params.data[1]
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
                    name: '投稿日期',
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
                        name: '播放量',
                        type: 'line',
                        showAllSymbol: true,
                        data: videoList1
                    }
                ]
            });
            myChart.on('click', function (params) {
                if (params.componentType === 'series') {
                    window.open('http://www.bilibili.com/video/av' + params.data[2], '_blank');
                }
            });

            // 显示结果
            $('.user-tips').fadeOut(100, function() {
                $('.submit-result').fadeIn(100);
            });
            // 取消禁用图标
        });

}

function dataResolve(data) {
    var analysisResult = dataAnalyse(data);
    $('.total-post-count').html(analysisResult.postAmount + ' 次');
    $('.average-interval').html(analysisResult.averageInterval);
    $('.latest-post-interval').html(analysisResult.latestInterval);
    $('.total-viewer').html(analysisResult.totalViewer + ' 次');
    $('.average-viewer').html(analysisResult.averageViewer + ' 次/视频');
    $('.above-viewer-rate').html(analysisResult.aboveAverageRate * 100 + '%');
    $('.total-length').html(analysisResult.totalLength + ' 分钟');
    $('.average-length').html(analysisResult.averageLength + ' 分钟');


    // 最近一次投稿
    $('.latest-post-title').html('<a href="http://www.bilibili.com/video/av'+ data[0].aid +'" target="_blank">'
        + data[0].title + '</a>');
    $('.latest-post-time').html(data[0].created);

    // 排行榜前三
    for(var i = 0; i < 3; i++) {
        var li = $('.viewer-number-list li').eq(i);
        li.children('.viewer-title').html((i+1) + '.&nbsp;<a href="http://www.bilibili.com/video/av'+ analysisResult.top3Video[i].aid +'" target="_blank">'
            + analysisResult.top3Video[i].title + '</a>');
        li.children('.viewer-count').html((+analysisResult.top3Video[i].play).format() + ' 次播放');
        li.children('.viewer-time').html(analysisResult.top3Video[i].created);

    }

}

/*
 * 分析数据
 * 注意data数据是按时间的倒序来的!!!!
 */
function dataAnalyse(data) {
    var totalViewer = 0;
    var totalLength = 0;
    var postAmount = data.length;
    var startTime = data[data.length - 1].created;
    var latestTime = data[0].created;
    var totalDurationMilSec = ((new Date(latestTime)).getTime() - (new Date(startTime)).getTime());  // 总投稿时间
    var latestInterval = timeFormat((new Date()).getTime() - (new Date(latestTime)).getTime());

    data.map(function (value, index) {
        // 总浏览量
        totalViewer += +value.play;
        // 总时长
        var formatedTime = parseTime(value.length);
        var lengthMinute = formatedTime.minute + (+(formatedTime.second / 60).toFixed(1));
        totalLength += lengthMinute;
    });
    var averageViewer = +(totalViewer / postAmount).toFixed(0);
    var averageLength = +(totalLength / postAmount).toFixed(1);

    // 计算高于平均观看量的数量
    var aboveAverageAmount = 0;
    data.map(function (value) {
        if (value.play > averageViewer) {
            aboveAverageAmount++;
        }
    });

    // 按播放数重新排序
    var dataSorted = $.extend([], data).sort(function(a, b) {
        if(a.play > b.play) {
            return -1;
        }
        if(a.play < b.play) {
            return 1;
        }
        return 0;
    }).splice(0,3);

    return {
        totalViewer: totalViewer.format(),
        postAmount: postAmount,
        averageViewer: averageViewer.format(),
        aboveAverageRate: (aboveAverageAmount / postAmount).toFixed(4),
        totalDuration: timeFormat(totalDurationMilSec),
        averageInterval: timeFormat(totalDurationMilSec / postAmount),
        latestInterval: latestInterval,
        totalLength: (+totalLength.toFixed(0)).format(),
        averageLength: averageLength,
        top3Video: dataSorted
    }
}


/**
 * 时间转化,将毫秒时间变为小时or天
 * @param {number} milSecond
 * @return string
 */
function timeFormat(milSecond) {
    var hour = milSecond / 1000 / 60 / 60;
    if (hour < 48) {
        return hour.toFixed(1) + ' 小时';
    }
    else {
        return Math.round(hour / 24) + ' 天';
    }
}

/**
 * 解析时间(格式为xx:xx)
 *
 */
function parseTime(timeStr) {
    var timeArr = timeStr.split(':');
    if (timeArr.length === 3) {
        return {
            hour: +timeArr[0],
            minute: +timeArr[1],
            second: +timeArr[2]
        }
    }
    else if (timeArr.length === 2) {
        return {
            minute: +timeArr[0],
            second: +timeArr[1]
        }
    }
    else {
        return false;
    }
}

/**
* 时间格式化
*/
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
};

/**
* 数字格式化
*/
Number.prototype.format = Number.prototype.format || function() {
    nStr = this + '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{4})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};