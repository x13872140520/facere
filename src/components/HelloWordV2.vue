<template>
  <div class="hello">
    <div class="page-title">
    <div >微教通-智能人脸考勤系统</div>
    <span @click="currentType('sign')" :class="{active:currentPage=='sign'}">人脸考勤签到</span>
    <span @click="currentType('capture')" :class="{active:currentPage=='capture'}">人脸信息采集</span>
    </div>
    <div class="demo-wrapper">
      <div style="position:relative;display:flex;">
        <div class="left-box">
          <div class="fourCorner">
              <div class="leftTop"></div>
              <div class="rightTop"></div>
              <div class="rightBottom"></div>
              <div class="leftBottom"></div>
            </div>
         <div class="coverpage" v-if="!isDetectFace||opencoverpage">
            <div  :class="{avatarwaitForDetect:waitForDetect,'avatar':true}"><div class="shadow"></div></div>
            <div  :class="{waitForDetect:waitForDetect,'fivepoint':true}"></div>
            
            <div class="kaoqingbtn"  @click="goOnCapture()" >开始考勤</div>
         </div>

           
            <video  @loadedmetadata="Play($event)"  @loadeddata="onLoadData()" id="inputVideo" autoplay muted playsinline style="object-fit:cover;" width="640" height="480"></video>
            <canvas id="overlay"   style="left:0;top:0;z-index:99;width:640px;height:480px;position:absolute"/>
            </div>
             <!-- 抓拍人脸图片显示 -->
            <canvas id="mycanvas" width="640" height="480" ref="mycanvas"></canvas>
            <img src="../assets/zhoudi4.jpg" id="inputimg" ref="inputimg" style="position: absolute;width: 640px;height:480px;position: absolute;left: 0;opacity:1;">
            <div class="right-box">
              <div class="hiddenScroll">
              <div class="right-box-title" v-if="currentPage=='sign'">学员考勤列表</div>
              <div class="right-box-title" v-if="currentPage=='capture'">选择学员进行人脸采集</div>
              <div class="right-box-content" v-if="currentPage=='capture'">
                <div class="right-box-content-sign" v-if="currentPage=='sign'"></div>
                <div class="right-box-content-capture" v-if="currentPage=='capture'">
                  <search @searchResult="getSearchResult" :searchList="searchList" @searching="searching"></search>
                  <div class="searchResultList" v-if="searchResult" >
                    <div style="color:black;margin-bottom: 5px;"><span class="student_name">{{searchResult.tname}}</span><span class="student_phone">{{searchResult.mobile}}</span></div>
                    <!-- 这里的学生图片来自不同的数据源 -->
                    <div >
                      <div class="imgItem sss" >
                        <img :src="searchResult.headimage" alt="">
                        <!-- <span class="delIcon" @click.stop="delthisimg(searchResult.stu_id)">×</span> -->
                      </div>
                    </div>
                      <div class="imgItem"  v-if="underCatching"><img :src="currentVideoImgUrl" alt=""></div>
                  </div>
                  <div class="searchBtn" v-if="searchResult&&!underCatching" @click="setFaceData()" >拍摄</div>
                  <div class="searchBtn" v-if="underCatching" @click="setFaceData()" >重新拍摄</div>
                  <div class="searchBtn" v-if="underCatching" @click="submitFaceMatcher()" >确认提交</div>
                </div>
                </div>
                 <div class="right-box-content stuList" v-if="currentPage=='sign'&&isDetectFace&&!opencoverpage" >
                   <!-- 已经签到的学员图片列表 -->
                   <div class="userItem" v-for="(item,index) in signedStuList" :key="index">
                     <div><img class="useravatar" :src="item.sign_img"/></div>
                     
                     <div class="usercenter">
                        <div class="username">{{item.stu_name}}</div>
                        <div class="signtime">{{item.sign_time}}</div>
                     </div>
                     <span class="signbtn">签到</span>
                   </div>
                  
                  
                 </div>
                <div class="right-box-btn stopkaoqingbtn" @click="stopCapture()" v-if="currentPage=='sign'&&isDetectFace&&!opencoverpage">停止考勤</div>
              </div>
               
            </div>
      </div>
      <div class="rule">
        <h1>注意事项:</h1>
        <p>1. 请使用谷歌浏览器，否则不能进行人脸考勤<a target="_blank" href="http://www.chromeliulanqi.com/">下载谷歌浏览器&gt;</a></p>
        <p>2. 使用前请检查摄像设备是否已经正确链接</p>
        <p>3. 学员需先完成人脸信息采集，否则不能进行人脸考勤</p>
        <p>4. 九岁以下小孩，建议每三个月更新一次照片</p>
        <p>5. 为了保障流畅的体验,请在系统运行内存8G，CPU主频2.1Ghz,操作系统win7以上的时候使用</p>
      </div>
            <!-- <div class="operator-btn"  @click="goOnCapture()" >开始考勤</div> -->
             <!-- <div class="operator-btn" @click="stopCapture(1)" >停止考勤</div>
            <div class="operator-btn" @click="setCaptureData()" >采集人脸特征数据</div>
            <div class="operator-btn" @click="clearCaptureData()" >清除人脸特征数据</div>
            <div class="operator-btn" @click="takePhoto()" >视频截图</div>
            <div class="operator-btn"  >选择学员进行采集</div> -->
            <!-- 人脸特征数据显示区域 -->
            <!-- <div v-if="faceMatcher">
            <div v-for="(item,index) in faceMatcher.labeledDescriptors" :key="index">
                <div >{{item.label}}</div>
                <div v-for="(descri,descrIndex) in item.descriptors" :key="descrIndex">{{descri}}</div>
            </div>
           </div> -->
           
    
  </div>
  </div>
</template>

<script>
import { compileFunction } from 'vm';
import { Toast } from 'vant'
import search from '../components/search.vue';
import * as qiniu from 'qiniu-js'
import qs from 'qs'
import axios from 'axios'
export default {
  name: 'HelloWorld',
  data(){
    return{
      initStatu:true,
      timer:null,
      result:null,
      faceMatcher:null,
      faceMatchers:null,
      context:null,
      videoEl:null,
      imgEl:null,
      canvasEl:null,
      captureFre:1000,
      data:null,
      currentPage:'sign',
      studentSignList:null,
      studentCaptureList:null,
      searchName:null,
      searchList:[],
      searchResult:null,  
      waitForDetect:false,
      isDetectFace:false,
      currentVideoImgUrl:null,
      underCatching:false,
      opencoverpage:false,
      debugToken:null,
      qitoken:null,
      promiseArr:[],
      keyStr:[],
      //传给人脸库的数据
      finalOnePerson:[],
      currentStuname:null,
      stuListImg:[{
        img_url:'',
        username:'',
        signTime:'',
        signIn:'',
      }],
      isFirstGetFacePool:true,
      stuList:[],
      signedStuList:[],
      currentSignImg:null
    }
  },
  props: {
    msg: String
  },
  mounted(){
    
    console.log('hello world mounted');
    console.log(faceapi);
    console.log(faceapi.nets);
    Date.prototype.format = function(format) {
	let o = {
	"M+": this.getMonth() + 1,
	"d+": this.getDate(),
	"H+": this.getHours(),
	"m+": this.getMinutes(),
	"s+": this.getSeconds(),
	"q+": Math.floor((this.getMonth() + 3) / 3),//季度
	"f+": this.getMilliseconds(),//毫秒
	};
	if(/(y+)/.test(format))
		format = format.replace(RegExp.$1, this.getFullYear() + "").substr(4 - RegExp.$1.length);
	for(let k in o) {
		if(new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	}
	return format;
}
    var that =this
    //1111111111111111https://www.yun61.com/member/index.php?m=face_sign&ac=get_token
    ///222222222222222https://apidata.yun61.com/index.php?r=mock_api/debug_token
       axios.get('https://apidata.yun61.com/index.php?r=mock_api/debug_token').then(function(res){
         console.log('res');
          console.log(res);
         if(res.status==200){
            that.debugToken=res.data.trim()
         }else{
           Toast.fail(res.statusText)
         }
       
      })
     
         
  },
   methods:{
  
    dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
},
     getSign(stuid,distance){
       var that =this
       //签到并且在学员考勤列表画出图片
       var currentCaptureName=''
       this.stuList.map(function(x){
         if(stuid == x.stu_id){
           currentCaptureName=x.stu_name
         }
       })
       console.log('学生id:'+stuid+'签到,名字为'+currentCaptureName);
       axios.get('https://apidata.yun61.com/index.php?r=api/face_is_stu_able',{
         params:{
                    stu_id:stuid,
                 }
       }).then(function(res){
         console.log('res.data.code');
          console.log(res);
            console.log(res.data);

         if(res.data.code==200){
           console.log('生成图片发起签到请求');
           //1.生成canvas画布，然后在画布上画出当前屏幕的图片，然后将canvas转成blob格式图片，然后拿七牛的token上传这个blob图片，拿到图片的pkey。
        that.context=that.$refs.mycanvas.getContext("2d")
        that.context.drawImage(that.videoEl, 0, 0, 640, 480);
        that.$refs.inputimg.src=that.$refs.mycanvas.toDataURL()
        that.currentVideoImgUrl=that.$refs.mycanvas.toDataURL()
        var xxxx = that.dataURLtoBlob(that.currentVideoImgUrl)
        // that.$refs.mycanvas.toBlob(function(target){
         
        //   that.currentSignImg=target
        //   console.log('toBlob OK');
        //   console.log(target)
        //   console.log(that.currentSignImg)
        //   console.log(that.currentVideoImgUrl);
        //   console.log()
          
        //   })

           axios.get('https://apidata.yun61.com/index.php?r=api/qiniu_params',{
          params:{
            apidata_token:that.debugToken,
          }
        }).then(function(res){
            that.qitoken=res.data.data.qn_token
       
            that.keyStr=[]
            var putExtras = {
            fname:  that.randomChar(),
            params: {},
            mimeType:  null
        };
            var configs = {
            useCdnDomain: false,
            disableStatisticsReport: false,
            retryCount:6
        };
        function readBlobAsDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);};
    a.readAsDataURL(blob);
}
            console.log('that.currentSignImg');
            console.log(that.currentSignImg);
            readBlobAsDataURL(xxxx, function (dataurl){
              console.log('qiuqiuqiu');
              
    console.log(dataurl);
});
            var observable = qiniu.upload(xxxx, that.randomChar(), that.qitoken, putExtras, configs)
            var subscription = observable.subscribe({
            next:function(response){},
            complete:function(res){
              console.log('上传七牛云完成!');
              that.keyStr=res.key+'';
               axios.post('https://apidata.yun61.com/index.php?r=api/face_sign',qs.stringify({
                  apidata_token:that.debugToken,
                  stu_id: stuid,
                  pkey:that.keyStr,
             })).then(function(re){
               console.log('签到成功');
               console.log(re);
               if(re.data.code==200){
                 that.signedStuList.unshift({
          stu_name:currentCaptureName,
          sign_time:(new Date().format('yyyy-MM-dd HH:mm:ss')),
         sign_img:'https://space.yun61.com/'+that.keyStr+'?imageView2/2/w/64/h/48',
          //sign_img: that.currentVideoImgUrl
        })
               }
          
               console.log( that.signedStuList)
             })
            }
         })
             
        })
        
         }
         
       })
     },
     getFacePool(resolve){
       var that =this
         axios.get('https://apidata.yun61.com/index.php?r=api/face_stu_bind_list',{
        params:{
                    apidata_token:that.debugToken,
                 }
      }).then(function(res){

          if(res.data.code==200){
              console.log('dadade niupi');
                 console.log(res.data.data.stu_list);
                 that.stuList=res.data.data.stu_list
                 console.log(that.stuList);
                 var labeledFaceDescriptors =[]
                  that.stuList.map((x)=>{
                   labeledFaceDescriptors.push(x.descriptor) 
                  })
                  console.log('labeledFaceDescriptors啦啦啦');
                  console.log(labeledFaceDescriptors);
                   var labelContent=[]
                  //思路 ：拿faceMatcher对象，通过content体系改写这个对象的descriptor和label，生成labeledFaceDescriptors
                    labeledFaceDescriptors.map(function(v,i){
                    var content = JSON.parse( JSON.stringify(that.faceMatcher));
                    console.log('that.faceMatcher应该有值');
                    console.log(that.faceMatcher)
                    var results = Object.values(v.descriptors[0])
                    content.labeledDescriptors[0].descriptors[0] = new Float32Array(results);
                    var newContentArray=[]
                    newContentArray.push(content.labeledDescriptors[0].descriptors[0])
                    var testresult = new faceapi.LabeledFaceDescriptors(v.label, newContentArray);
                    labelContent.push(testresult)
                    })
                    console.log(labelContent);
                    that.faceMatcher =  new faceapi.FaceMatcher(labelContent);
               if(resolve){
                 resolve();
               }
          }else{
            Toast.fail(res.data.msg)
          }
               
      })
     },
     getQiTokenAndUpload(){
       var that=this
       axios.get('https://apidata.yun61.com/index.php?r=api/qiniu_params',{
          params:{
            apidata_token:that.debugToken,
          }
        }).then(function(res){
          that.qitoken=res.data.data.qn_token
          that.promiseArr=[]
          that.keyStr=[]
          that.putb64(that.currentVideoImgUrlBlob,that.randomChar(),that)
           Promise.all(that.promiseArr).then(function(resp){
             axios.post('https://apidata.yun61.com/index.php?r=api/face_stu_bind_add',qs.stringify({
              
                  apidata_token:that.debugToken,
                  stu_id: that.searchResult.stu_id,
                  pkey:that.keyStr,
                  descriptor:that.finalOnePerson
                  
               
             })).then(function(rs){

              if(rs.data.code==200){
              console.log('成功的写入学生的照片与特征，重新刷新页面');
              var promise = new Promise(function(resolve){
                    that.getFacePool(resolve)
                }) 
              promise.then(function(){
                  that.stuList.map((x)=>{
                 if(that.searchResult.stu_id==x.stu_id){
                     console.log('成功给出当前拍摄学生的信息');
                     console.log(x);
                     
                     var obj={
                       tname:x.stu_name,
                       mobile:x.mobile,
                       stu_id:x.stu_id,
                       headimage:x.pkey
                     }
                     that.searchResult=obj
                 }
               })
                 that.underCatching=false
               })
               }else{
                 Toast.fail(rs.data.msg)
               }
               
              
             })
        
               
           })
        })
     },
     putb64(file,key,that){
      
      var putExtra = {
            fname: key,
            params: {},
            mimeType:  null
        };
      var config = {
            useCdnDomain: false,
            disableStatisticsReport: false,
            retryCount:6
        };
         
        that.promiseArr.push(new Promise((resolve,reject)=>{
          console.log('传进来的Blob');
          console.log(file)
            var observable = qiniu.upload(file, key, that.qitoken, putExtra, config)
            var subscription = observable.subscribe({
            next:function(response){},
            complete:function(res){
              console.log('上传七牛云完成!');
              that.keyStr=res.key+'';
              resolve();
            }
         })
          }))
        
        
},
     randomChar(l = 10){
            var  x = "0123456789qwertyuioplkjhgfdsazxcvbnm";
            var  tmp="";
            var timestamp = (new Date().getTime() / 1000).toFixed();
            for(var i = 0; i < l; i++)  {
              tmp  += x.charAt(Math.ceil(Math.random()*100000000)%x.length);
            }
            return timestamp + tmp;
      },
     submitFaceMatcher(){
         //此方法有3步骤，，1采集人脸特征数据，2上传截图至七牛云，3将pkey作为结果请求上传至后台
         //2.人脸特征数据在this.faceMatcher
         console.log('submitFaceMatcher');
         
       
       this.getQiTokenAndUpload();
       
     },
     searching(searchName){
       var that =this
        axios.get('https://apidata.yun61.com/index.php?r=api/face_stu_list',{
          params:{
            apidata_token:that.debugToken,
            keyword:searchName
          }
        }).then(function(resp){
          console.log(resp.data.data.stu_list);
        
          that.searchList=resp.data.data.stu_list
          console.log(that.searchList);
          
        })
     },
    //  delthisimg(id,index){
    //    this.searchList
    //    for(var i=0;i<this.searchList.length;i++){
    //      if(id==this.searchList[i].stu_id){
    //        this.searchList[i].headimage.splice(index,1)
    //      }
    //    }
    //  },
     getSearchResult(res,index){
      console.log('获得搜索结果');
      console.log(res);
      this.searchResult=res;
        //qing
     },
     currentType(type){
       this.currentPage=type;
       if(type=='capture'){
         if(this.timer){
           this.opencoverpage=false;
         }else{
            this.goOnCapture();
            this.opencoverpage=false;
         }
        
         
        
       }else if(type=='sign'){
          this.opencoverpage=true
       }
     },
     onLoadData(){
       console.log('onLoadData');
      this.opencoverpage=false;
      this.isDetectFace=true;
     },
     setFaceData(){
      //  if(this.searchResult.headimage.length>1){
      //    Toast.fail('已经有两张图片了，请删除一张再重新拍摄')
      //    return
      //  }else 
       if(!this.isDetectFace){
         Toast.fail('请开始考勤或打开摄像头')
         return
       }else{
       
       //1.图片的src在that.$refs.inputimg.src
        this.underCatching=true
        this.context=this.$refs.mycanvas.getContext("2d")
        this.context.drawImage(this.videoEl, 0, 0, 640, 480);
        this.$refs.inputimg.src=this.$refs.mycanvas.toDataURL()
        this.currentVideoImgUrl=this.$refs.mycanvas.toDataURL()
        var that=this
        this.$refs.mycanvas.toBlob(function(target){
          console.log('toBlob OK');
          that.currentVideoImgUrlBlob=target
        })
        this.setCaptureData();
       
       }
       
     },
     
     async setCaptureData(){
      console.log('采集人脸数据');
      try{
        if(this.result){
        //this.faceMatcher 相当于人脸库资料.
          this.faceMatcher = new faceapi.FaceMatcher(this.result)
          //传单人的采集信息至后台
          var content = JSON.parse( JSON.stringify(this.faceMatcher));
          console.log('setCaptureData');
          
          console.log(content);
          
        //读取faceMatcher原对象数据，再通过createFaceMatcher创建一个新faceMatcher对象，目的是保留原faceMatcher上的方法和属性，但是又能修改关键的descriptors,label的数据(不允许直接在原对象上修改。)，其中通过LabeledFaceDescriptors修改了label，
    for (var x = 0; x < content.labeledDescriptors.length; x++) {
      for (var y = 0; y < content.labeledDescriptors[x].descriptors.length; y++) {
        var results = Object.values(content.labeledDescriptors[x].descriptors[y]);
        console.log('quququ');
        console.log(results);
        
        content.labeledDescriptors[x].descriptors[y] = new Float32Array(results);
        console.log('content.labeledDescriptors[x].descriptors[y]1111');
        console.log(content.labeledDescriptors[x].descriptors[y]);
      }
    }
    console.log('提取特征信息，结果名字和stu_id');
    console.log(this.searchResult.tname+','+this.searchResult.stu_id);
    
    
          this.faceMatcher = await this.createFaceMatcher(content,this.searchResult.stu_id);
    
      }else{
        alert('请先侦测人脸')
      }
      }catch(e){
        alert('照片辨识度不高,请重新拍摄一张')
      }
      
          
     },
     //要求data格式准确 需是JSON.parse的结果
     async  createFaceMatcher(data,username) {
       var that =this
        const labeledFaceDescriptors = await Promise.all(data.labeledDescriptors.map(className => {
        const descriptors = [];
        for (var i = 0; i < className.descriptors.length; i++) {
            descriptors.push(className.descriptors[i]);
        }
          that.finalOnePerson=new faceapi.LabeledFaceDescriptors(username, descriptors);
          console.log('fansigere');
          console.log(descriptors);
          
             return new faceapi.LabeledFaceDescriptors(username, descriptors);
          
         
        }))
        console.log('qiaoyiqiao');
        //往后端传labeledFaceDescriptors
         console.log(labeledFaceDescriptors);
        return new faceapi.FaceMatcher(labeledFaceDescriptors);
},
     clearCaptureData(){
       this.faceMatcher=null
     },
     goOnCapture(){
       try{
          console.log('goOnCapture');
       console.log(this.timer);
       if(this.timer){
          this.waitForDetect=true;
          this.opencoverpage=false;
       }else{
          this.waitForDetect=true;
          this.opencoverpage=false;
          this.run();
          console.log('开始侦测人脸');
       }
       
       }catch(e){
         console.log(e);
         
       }
      
       
     
       
     },
     stopCapture(type){
       if(type==1){
        console.log('暂停侦测人脸');
       clearInterval(this.timer)
       this.timer=null
       console.log(this.timer);
       
       }else{
         console.log('暂停侦测人脸');
       this.isDetectFace=false;
       clearInterval(this.timer)
       this.timer=null
        console.log(this.timer);
         }
       
     },
     
     async  run() {
      // await faceapi.nets.faceLandmark68Net.loadFromUri('/member2/face/models')
      // await faceapi.nets.faceRecognitionNet.loadFromUri('/member2/face/models')
      // await faceapi.nets.tinyFaceDetector.loadFromUri('/member2/face/models')
      var that=this
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      that.videoEl = $('#inputVideo').get(0)
      that.videoEl.srcObject = stream
      
      that.timer= setInterval(function(){
          console.log('持续capture中');
          console.log(that.timer);
          that.Play();
      },that.captureFre)
      //先把videoEl视频截图生成Img
      
    },
     takePhoto(){
       var that =this
       console.log('takePhoto');
       
        that.context=that.$refs.mycanvas.getContext("2d")
        that.context.drawImage(that.videoEl, 0, 0, 640, 480);
        that.$refs.inputimg.src=that.$refs.mycanvas.toDataURL()
      
        
     },
    //1先打开摄像头，2然后再截图，3然后再根据截图作多脸侦测，4再生成多脸的特征数据。 234是循环步骤，抽帧是一种消耗性能的操作。应该尽可能的优化它。
     async  Play() {
       console.log('Play');
       var that=this
         var pro = new Promise(function(resolve,reject){
       //  that.takePhoto();
         resolve();
       })
       pro.then( async function(){
       try{
         console.log('before detectSingleFace');
      
      that.videoEl = $('#inputVideo').get(0)
      that.imgEl=$('#inputimg').get(0)
      console.log('22:17')
      var inputSize = 512
      var scoreThreshold = 0.5
     that.result  = await faceapi.detectSingleFace(that.videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })).withFaceLandmarks().withFaceDescriptor()
     
      console.log('pppppppppppp');
      console.log(that.result);//多脸的情况下是Array
      
      if(that.faceMatcher){
       
          const bestMatch = that.faceMatcher.matchDescriptor(that.result.descriptor)
         if(bestMatch.distance<0.4&&that.currentPage=='sign'&&!that.opencoverpage&&that.isDetectFace){
           that.getSign(bestMatch.label)
         }else{
           console.log('非采集的人脸');
           
         }
         
         //识别到库里的人了
        
         
      }
     
      if (that.result) {
        const canvas = $('#overlay').get(0)
        const dims = faceapi.matchDimensions(canvas, that.videoEl, true)
        //画人脸框
        that.waitForDetect=false;
        that.isDetectFace=true;
        faceapi.draw.drawDetections(canvas, faceapi.resizeResults(that.result, dims))
        if(that.isFirstGetFacePool){
          that.faceMatcher = new faceapi.FaceMatcher(that.result)
          that.getFacePool()
          that.isFirstGetFacePool=false
        }
        
      }
       }catch(e){
         console.log(e);
         
       }
       })
    },
     

 
    
  },
 
  components:{
    search
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.stuList{
  height: 380px;
    overflow: auto;
}
.rule{
  color:#ffffff;
  font-size:14px;
  margin-top: 50px;
}
.rule h1{
   font-size:14px;
}
.rule a{
   color:#ffffff;
   font-size:14px;
   background:#007651;
   padding: 5px;
  margin-left: 10px;
}
.rule p {
  margin:0;
  padding: 2px;
}
.userItem{
 display:flex;
 align-items:center;
 padding: 10px 10px 0 10px;
 justify-content: space-between;
}
.usercenter{
  padding:0 5px;
}
.useravatar{
    width:64px;
    height:48px;
    object-fit: cover;
    display: inline-block;
  }
  .username{
     white-space: nowrap;
  }
  .signbtn{
    color: teal;
    border: 1px solid teal;
    padding: 0px 8px;
    height: 25px;
    line-height: 25px;
 white-space: nowrap;
  }
  .signtime{
    white-space: nowrap;
  }
.hello{
  width:980px;
  margin:0 auto;
}
.page-title span{
  
  cursor: pointer;
}
.kaoqingbtn{
    margin: 0 auto;
    bottom: 20px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width:150px;
  height:40px;
  line-height:40px;
  background:#007651;
  color:#ffffff;
  text-align:center;
  margin-bottom:10px;
}
.stopkaoqingbtn{
  margin: 10px auto 0;
  bottom: 20px;
  width:150px;
  height:40px;
  line-height:40px;
  background:#007651;
  color:#ffffff;
  text-align:center;
  margin-bottom:10px;
}
#inputVideo{
  position: absolute;
  z-index: 2;
}
.avatar{
  width: 260px;
  height: 260px;
  background:url('../assets/avatar.png') no-repeat center center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  overflow: hidden;
  border-radius: 50%;
}
.fivepoint{
  width: 304px;
  height: 304px;
  background:url('../assets/fivepoint.png') no-repeat center center;
  position: absolute;
  left: 170px;
  top: 85px;
  transform-origin:50% 50%;
  /* animation: fivepointmove 2s ease 0 infinite normal none; */
  animation:fivepointmove 7s linear infinite;
  transform:rotate(0deg);
}
.waitForDetect{
  animation:fivepointmove 1s linear infinite!important;
}
@keyframes fivepointmove
{
     0%   {transform: rotate(0deg)}
    100%  {transform: rotate(-360deg)}
}

.shadow{
  width: 260px;
  height: 127px;
  background:url('../assets/lineshadows.png') no-repeat center center;
  position: absolute;
  left: 0px;
  top: 0;
  transform: rotate(0deg);
  animation:shadowmove 10s linear infinite;
    
}
.avatarwaitForDetect .shadow{
  animation:shadowmove 5s linear infinite;
}
@keyframes shadowmove
{
     0%   {top: 0 ;}
    
    50%  {top: 256px;}
     100% {top: 0;} 
}


.coverpage{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index:999;
    background: #fff;
}
.fourCorner{
    height: 480px;
    position: absolute;
    width: 640px;
    z-index: 1;
     
}
.fourCorner >div{
    position: absolute;
    width: 50px;
    height: 50px;
    background: #007651;
        z-index: 1;
}
.fourCorner .leftTop{
    position: absolute;
    top: -3px;
    left: -3px;
}
.fourCorner .rightTop{
  position: absolute;
    top: -3px;
    right: -3px;
}
.fourCorner .rightBottom{
position: absolute;
    bottom: -3px;
    right: -3px;
}
.fourCorner .leftBottom{
  position: absolute;
    bottom: -3px;
    left: -3px;
}
.searchBtn{
    height: 30px;
    line-height: 30px;
    background: green;
    color: #ffffff;
    border-radius: 5px;
    text-align: center;
    margin: 10px 12px 10px 12px;
    cursor: pointer;
    display: inline-block;
    padding: 0 10px;
}
.delIcon{
    color: #fff;
    position: absolute;
    top: 5px;
    right: 4px;
    font-size: 33px;
    background: transparent;
    border-radius: 50%;
    border: 1px solid #fff;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
.hiddenScroll{
  overflow-y: scroll;
    width: 106%;
    height: 100%;
}
.searchResultList{
  background: #F7F7F7;
    margin: 0 12px;
    border-radius: 5px;
    padding: 10px;
}
.imgItem{
  position: relative;
}
.imgItem img{
  width:236px;
  height:177px;
  object-fit: cover;
}
.operator-btn{
  width:150px;
  height:40px;
  line-height:40px;
  background:#007651;
  color:#ffffff;
  border-radius:5px;
  text-align:center;
  margin-bottom:10px;
}
#mycanvas{
  position:absolute;
  opacity: 0;
}

.left-box{
    width:640px;
    height:480px;
    /* background:url('../assets/pg.jpg') no-repeat center center; */
    background:#fff;
    position: relative;
}
.right-box{
    width: 310px;
    height: 480px;
    background: #ffffff;
    margin-left: 30px;
    overflow: hidden;
    position: relative;
}
.right-box-title{
  padding: 10px 5px;
    border-bottom: 1px solid #ccc;
    margin: 0 10px;
}
</style>
