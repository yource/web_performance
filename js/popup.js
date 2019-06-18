var score = 0;
var chart1, chart2, chart3, option1, option2, option3;

$(function() {

    if (window.navigator.userAgent.toLowerCase().indexOf("chrome") < 0) {
        $("#loadingTip").html("Please use Chrome to load this plugin");
        return;
    }

    initChart();

    $(".item").click(function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(".chart").hide();
        $("#chart" + $(this).attr("id").substr(4, 1)).show();
    })

    sentToCurrentConent();

    setInterval(function() {
        sentToCurrentConent();
    }, 500);

});

function initChart() {
    chart1 = echarts.init(document.getElementById('chart1'));
    option1 = {
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisTick: {
                alignWithLabel: true
            }
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '直接访问',
            type: 'bar',
            barWidth: '60%',
            data: [10, 52, 200, 334, 390, 330, 220]
        }]
    };
    chart1.setOption(option1);

    chart2 = echarts.init(document.getElementById('chart2'));
    option2 = {
        title: {
            text: '某站点用户访问来源',
            subtext: '纯属虚构',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
        },
        series: [{
            name: '访问来源',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
                { value: 335, name: '直接访问' },
                { value: 310, name: '邮件营销' },
                { value: 234, name: '联盟广告' },
                { value: 135, name: '视频广告' },
                { value: 1548, name: '搜索引擎' }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    chart2.setOption(option2);

    chart3 = echarts.init(document.getElementById('chart3'));
    option3 = {
        tooltip: {
            formatter: "{a} <br/>{b} : {c}%"
        },
        series: [{
            name: 'Memory',
            type: 'gauge',
            detail: { formatter: '{value} Mb' },
            data: [{ value: 50, name: 'Used Memory' }]
        }]
    };
    chart3.setOption(option3);
}

// 发消息给当前标签页的content-script
function sentToCurrentConent() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs.length ? tabs[0].id : null, "get all performance", function(response) {
            if (response != "null") {
                setPerformance(response);
            }
        });
    });
}

// 处理所有performance数据
function setPerformance(performance) {

    var requestNum = performance.entries.length;
    $("#allRequestNum").html(requestNum);

    var usedMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
    $("#usedMemory").html(usedMemory.toFixed(2));

    var loadTime = (performance.timing.loadEventEnd - performance.timing.navigationStart) / 1000;
    $("#loadTime").html(loadTime.toFixed(2));

    option3.series[0].data[0].value = (Math.random() * 100).toFixed(2) - 0;
    chart3.setOption(option3, true);

    if (score == 0) {
        score = 99;
        $("#score").html(score);
    }
}