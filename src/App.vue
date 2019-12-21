<template>
  <div id="app">
    
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import 'babel-polyfill';
export default {
  name: 'app',
  mounted(){
    console.log('mounted');
    console.log(this);
    
  },
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background:#18A689;
  color: #2c3e50;
  height: 1000px;
}
#app .page-title{
    color: #ffffff;
    display: flex;
    align-items: center;
    padding: 60px 0;
}
#app .page-title >div{
  font-size:30px;
  margin-right:30px

}
#app .page-title >span{
  font-size:14px;
  height:30px;
  line-height:30px;
  padding:0 5px;
  background:#18A689;
  border:1px solid #ffffff;
}
#app .page-title .active{
  background:#007651;
}
</style>
