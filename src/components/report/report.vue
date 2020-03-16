<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
        <div id="main" style="width:800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
//1.导入echarts
import echarts from 'echarts'

export default {
    data(){
        return{
            list:[]
        }
    },
    created(){},
    //此时，页面上的元素已经被渲染完毕了
    async mounted(){
        const {data:res}=await this.$http.get(`${this.baseUrl}/report/report1`)
        if(!res.success){
            return this.$message.error("统计report1失败");
        }
        this.list=res.data;

        const xData=[],hd=[],hn=[],hb=[],xb=[],qt=[];
        for(let i=0;i<this.list.length;i++){
            xData.push(this.list[i].dt);
            hd.push(this.list[i].hd);
            hn.push(this.list[i].hn);
            hb.push(this.list[i].hb);
            xb.push(this.list[i].xb);
            qt.push(this.list[i].qt);
        }

        //基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));

        var option={
            title:{
                text:'堆叠区域图'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: ['华东','华南','华北','西部','其他']
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data:xData
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series:[
                {name:'华东',type: 'line',stack: '总量',areaStyle: {},data:hd},
                {name:'华南',type: 'line',stack: '总量',areaStyle: {},data:hn},
                {name:'华北',type: 'line',stack: '总量',areaStyle: {},data:hb},
                {name:'西部',type: 'line',stack: '总量',areaStyle: {},data:xb},
                {name:'其他',type: 'line',stack: '总量',areaStyle: {},data:qt}
            ]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    },
    methods:{}
}
</script>

<style lang="less" scoped>
    
</style>