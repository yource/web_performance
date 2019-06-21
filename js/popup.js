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
        var currentId = "#chart" + $(this).attr("id").substr(4, 1);
        $(currentId).show();
        if (currentId == "#chart1") {
            $("#moreTime").show();
        } else {
            $("#moreTime").hide();
        }
    });

    $("#tip").hover(function() {
        $("#tipContent").fadeIn(200);
    }, function() {
        $("#tipContent").fadeOut(100);
    })

    sentToCurrentConent();

    setInterval(function() {
        sentToCurrentConent();
    }, 500);

});

function initChart() {
    chart1 = echarts.init(document.getElementById('chart1'));
    option1 = {
        title: {
            text: "TIME COUNTING",
            x: "center",
            y: 40
        },
        color: ['#3398DB'],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: "{b} : {c} ms"
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: 80,
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: ['Other', 'Image', 'CSS', 'JS', 'XHR/Fetch']
        },
        series: [{
            name: '直接访问',
            type: 'bar',
            barWidth: '60%',
            data: [0, 0, 0, 0, 0, 0]
        }]
    };
    chart1.setOption(option1);

    chart2 = echarts.init(document.getElementById('chart2'));
    option2 = {
        title: {
            text: "REQUEST COUNTING",
            x: "center",
            y: 40
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b} Request: <br/> {c} items ({d}%)"
        },
        series: [{
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            label: {
                normal: {
                    formatter: '{b|{b}}：{c|{c}}',
                    rich: {
                        b: {
                            fontSize: 14
                        },
                        c: {
                            fontSize: 15
                        }
                    }
                }
            },
            data: [
                { value: 0, name: 'XHR' },
                { value: 0, name: 'JS' },
                { value: 0, name: 'CSS' },
                { value: 0, name: 'Img' },
                { value: 0, name: 'Others' }
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
        title: {
            text: "MEMORY FOOTPRINT",
            x: "center",
            y: 40
        },
        series: [{
            name: 'Memory',
            type: 'gauge',
            min: 0,
            max: 100,
            center: ['50%', '60%'],
            axisLine: { // 坐标轴线
                lineStyle: { // 属性lineStyle控制线条样式
                    width: 15
                }
            },
            detail: {
                formatter: '{value} Mb',
                fontSize: 16
            },
            data: [{ value: 50, name: '' }]
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

    var usedMemory = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2);
    $("#usedMemory").html(usedMemory);

    var loadTime = (performance.timing.loadEventEnd - performance.timing.navigationStart) / 1000;
    $("#loadTime").html(loadTime < 0 ? "..." : loadTime.toFixed(2));

    var tcpTime = (performance.timing.domainLookupEnd - performance.timing.domainLookupStart) + (performance.timing.connectEnd - performance.timing.connectStart);
    $("#tcp").html(tcpTime < 0 ? "..." : tcpTime + "μs");

    var domTime = performance.timing.domComplete - performance.timing.domInteractive;
    $("#dom").html(domTime < 0 ? "..." : domTime + "μs");

    var whiteTime = performance.timing.responseStart - performance.timing.navigationStart;
    $("#white").html(whiteTime < 0 ? "..." : whiteTime + "μs");

    var request_js = request_css = request_img = request_other = request_resource = request_ajax = 0;
    var requestTime = {
        js: 0,
        css: 0,
        xhr: 0,
        img: 0,
        other: 0,
        all: 0,
    };
    for (var i = 0; i < requestNum; i++) {
        var time0 = performance.entries[i].responseEnd - performance.entries[i].requestStart;
        if (!time0 || time0 < 0) {
            time0 = 0;
        }
        requestTime.all += time0;
        if (performance.entries[i].entryType == "resource") {
            request_resource++;
            if (performance.entries[i].initiatorType == "script") {
                request_js++;
                requestTime.js += time0;
            } else if (performance.entries[i].initiatorType == "link") {
                request_css++;
                requestTime.css += time0;
            } else if (performance.entries[i].initiatorType == "img" || isImg(performance.entries[i].name)) {
                request_img++;
                requestTime.img += time0;
            } else if (performance.entries[i].initiatorType == "xmlhttprequest" || performance.entries[i].initiatorType == "fetch") {
                request_ajax++;
                requestTime.xhr += time0;
            }
        } else {
            request_other++;
            requestTime.other += time0;
        }
    }

    option1.series[0].data = [
        requestTime.other.toFixed(2),
        requestTime.img.toFixed(2),
        requestTime.css.toFixed(2),
        requestTime.js.toFixed(2),
        requestTime.xhr.toFixed(2)
    ];
    chart1.setOption(option1, true);

    option2.series[0].data = [
        { value: request_ajax, name: 'XHR/Fetch' },
        { value: request_js, name: 'JS' },
        { value: request_css, name: 'CSS' },
        { value: request_img, name: 'Image' },
        { value: request_other, name: 'Others' }
    ];
    chart2.setOption(option2, true);


    option3.series[0].max = (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(1);
    option3.series[0].data[0].value = usedMemory;
    chart3.setOption(option3, true);

    if (loadTime > 0 && requestNum > 0 && usedMemory > 0) {
        score = (100 - loadTime - usedMemory).toFixed(1);
        $("#score").html(score);
    } else {
        $("#score").html("...");
    }
}

function isImg(url) {
    url = url.toLowerCase();
    if (url.indexOf(".png") > -1 || url.indexOf(".jpg") > -1 || url.indexOf(".jpeg") > -1 || url.indexOf(".gif") > -1 || url.indexOf(".bmp") > -1 || url.indexOf(".tif") > -1 || url.indexOf("svg") > -1) {
        return true;
    }
    return false;
}