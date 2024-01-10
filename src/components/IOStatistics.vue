<template>
    <div id="IOStatistics" :style="{ width: '1000px', height: '450px' }"></div>
</template>
 
<script lang="ts">
import { ta } from 'element-plus/es/locale';
import { defineComponent, onMounted, getCurrentInstance, onUnmounted } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
    props: {
        inData: {
            type: Number,
            required: true,
        },
        outData: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        var app: any = {};

        const stiIn = function(){
            return 5 + Math.round(Math.random() * 5);
        }
        const stiOut = function(){
            return Math.round(Math.random() * 5);
        }
        const categories = (function () {
            let now = new Date();
            let res = [];
            let len = 10;
            while (len--) {
                res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
                now = new Date(+now - 2000);
            }
            return res;
        })();
        const categories2 = (function () {
            let res = [];
            let len = 10;
            while (len--) {
                res.push(10 - len - 1);
            }
            return res;
        })();
        const data: number[] = (function () {
            let res = [];
            let len = 10;
            while (len--) {
                res.push(stiIn());
            }
            return res;
        })();
        const data2: number[] = (function () {
            let res = [];
            let len = 0;
            while (len < 10) {
                res.push(stiOut());
                len++;
            }
            return res;
        })();
        const data3: number[] = (function () {
            let res = [];
            let len = 0;
            while (len < 10) {
                res.push((data[len] - data2[len]));  // 在馆人数
                len++;
            }
            return res;
        })();


        const option = {
            title: {
                text: '人流信息监测',
            },
            // theme: 'dark',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#283b56'
                    }
                }
            },
            legend: {},
            toolbox: {
                show: true,
                feature: {
                    dataView: { readOnly: false },
                    restore: {},
                    saveAsImage: {}
                }
            },
            dataZoom: {
                show: true,
                start: 0,
                end: 100
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: true,
                    data: categories
                },
                {
                    type: 'category',
                    boundaryGap: true,
                    data: categories2
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    min:0,
                    max:1000,
                    name: '进/出馆人数',
                    boundaryGap: [0.2, 0.2]
                },
                {
                    type: 'value',
                    scale: true,
                    min:0,
                    max:1000,
                    name: '出馆人数',
                    show: false,
                    boundaryGap: [0.2, 0.2]
                },
                {
                    type: 'value',
                    scale: true,
                    min: 0,
                    max:1000,
                    position: 'right',
                    name: '在馆人数',
                    boundaryGap: [0.2, 0.2]
                },

            ],
            series: [
                {
                    name: '进馆人数',
                    type: 'bar',
                    data: data,
                    yAxisIndex: 0,
                },
                {
                    name: '出馆人数',
                    type: 'bar',
                    data: data2,
                    yAxisIndex: 0,
                },
                {
                    name: '在馆人数',
                    type: 'line',
                    data: data3,
                    yAxisIndex: 2,
                }
            ]
        };


        onMounted(() => {
            //初始化挂载
            // document.getElementById('myChart')?.removeAttribute('_echarts_instance_')
            // document.getElementById('myChart2')?.removeAttribute('_echarts_instance_')
            const echarts1 = echarts.init(document.getElementById('IOStatistics'))
            //添加配置
            echarts1.setOption(option)
            app.count = 11;
            setInterval(function () {
                let axisData = new Date().toLocaleTimeString().replace(/^\D*/, '');
                data.shift();
                data.push(props.inData);
                data2.shift();
                data2.push(props.outData);

                data3.shift();
                data3.push((data[data.length - 1] - data2[data2.length - 1]));

                categories.shift();
                categories.push(axisData);
                categories2.shift();
                categories2.push(app.count++);

                echarts1.setOption({
                    xAxis: [
                        {
                            data: categories
                        },
                        {
                            data: categories2
                        }
                    ],
                    series: [
                        {
                            data: data
                        },
                        {
                            data: data2
                        },
                        {
                            data: data3
                        }
                    ]
                });
            }, 3000);
            // 自适应
            window.onresize = function () {
                echarts1.resize()
            }
        })
        return {}
    }

})
</script>