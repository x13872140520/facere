<template>
    <div class="compo-search" id="compo-search" >
          <van-search placeholder="请输入学生姓名" v-model="searchName" id="testtest" ref="testtest" @input="searching()" @clear="clear()" @search="searched()" v-if="searchList"/>
                <div class="search-result-panel"  v-if="searchResultShow&&searchList"  id="searchresultpanel"  >
                  <ul>
                      <li v-for="(item,index) in searchList" :key="index" @click.stop="setSearchResult(item,index)">{{item.tname}}</li>
                  </ul>
                </div>
                <div class="overlay" v-if="searchResultShow" @click.stop="closeSearchResult()"></div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            searchResultShow:false,
            searchName:null,
            timer:null,
        }
    },
    props: {
    searchList: {
      type: Array,
    default: function () {
        return []
    }
    },
  },
    mounted(){
       
        
    },
    methods:{
        searched(){
            console.log('searched');
            
        },
        clear(){
            console.log('clear');
            
                this.searchName=null
              this.searchResultShow=false;
        },
        searching(){
            console.log('searching');
             this.searchResultShow=true;
             clearTimeout(this.timer)
             var that=this
             this.timer=setTimeout(function(){
                 that.$emit('searching',that.searchName)
             },500)
             
        },
        setSearchResult(item,index){
              console.log('setSearchResult');
            this.searchName=item.tname
            this.searchResultShow=false;
            this.$emit('searchResult',item,index)
        },
        closeSearchResult(){
            console.log('closeSearchResult');
             this.searchResultShow=false;
        },
    },
    watch:{
        searchResultShow(newV){
            console.log('searchResultShow');
            var _this =this
      _this.$nextTick(function(){
        
        $('#searchresultpanel').width(this.$refs.testtest.offsetWidth)
        $('#searchresultpanel').css({  left:this.$refs.testtest.offsetLeft, top:(this.$refs.testtest.offsetTop+this.$refs.testtest.offsetHeight)-20 ,padding:'10px 12px'})
      })
        },
        searchList(newV){
            console.log('searchListsearchList');
            console.log(newV);
            
        }
    }
}
</script>
<style scoped>
.compo-search{
    width:100%;
}
.search-result-panel{
   position: absolute;
    box-sizing: border-box;
  
    
    z-index:2;
    
}
.search-result-panel ul{
    box-shadow: 1px 1px 1px;
    border-radius:5px;
    background:#ffffff;
}
.search-result-panel ul li{
  list-style:normal;
  padding:5px;
  border-bottom:1px solid #ebedf0;;
  font-size: 14px;
}
.overlay{
    width:100vw;
    height:100vh;
    position: fixed;
    background: transparent;
    left:0;
    top:0;
}
li:hover{
    background:#18A689;
}
</style>