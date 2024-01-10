<template>
    <div id="TicketsStatistics" :style="{ width: '700px', height: '250px' }"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import * as echarts from 'echarts'

export default defineComponent({
    props: {
        totalTickets: {
            type: Number,
            required: true,
        },
        soldTickets: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: props.soldTickets, name: '已售出门票' },
                        { value: props.totalTickets - props.soldTickets, name: '剩余门票' },
                    ]
                }
            ]
        };



        onMounted(() => {
            let myChart = echarts.init(document.getElementById('TicketsStatistics'));
            myChart.setOption(option);
            setInterval(()=>{
                myChart.setOption({
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: ['40%', '70%'],
                            avoidLabelOverlap: false,
                            itemStyle: {
                                borderRadius: 10,
                                borderColor: '#fff',
                                borderWidth: 2
                            },
                            label: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                label: {
                                    show: true,
                                    fontSize: 40,
                                    fontWeight: 'bold'
                                }
                            },
                            labelLine: {
                                show: false
                            },
                            data: [
                                { value: props.soldTickets, name: '已售出门票' },
                                { value: props.totalTickets - props.soldTickets, name: '剩余门票' },
                            ]
                        }
                    ]
                })
            },3000);

            // 自适应
            window.onresize = function () {
                myChart.resize()
            }
        })

        return {}
    },
})
</script>
