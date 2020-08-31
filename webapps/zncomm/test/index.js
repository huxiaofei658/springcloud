$(function () {
    var j_data = [
        {"result":[{"_id":"868120202593601","imei":"868120202593601","deviceName":"2陕CL8940","status":"1","lat":34.357547,"lng":107.169487,"accStatus":"1","powerValue":null,"speed":"20","gpsTime":"2019-01-16 18:38:29"}]},
        {"result":[{"_id":"868120202593601","imei":"868120202593601","deviceName":"2陕CL8940","status":"1","lat":34.359847,"lng":107.169587,"accStatus":"1","powerValue":null,"speed":"20","gpsTime":"2019-01-16 18:38:29"}]},
        {"result":[{"_id":"868120202593601","imei":"868120202593601","deviceName":"2陕CL8940","status":"1","lat":34.356547,"lng":107.169687,"accStatus":"1","powerValue":null,"speed":"20","gpsTime":"2019-01-16 18:38:29"}]}
    ]
  
    "use strict";
    var qwe = 1 
    var firstLoad  = 1;
    
    var DOM,
        DATA,
        request = new shendun.util.request(),
        BDMap_map = new BMap.Map("allmap", {enableMapClick: false});

    BDMap_map.disableScrollWheelZoom()

    var $alertModal = $("#alert-modal");
    var ws_alarm_monitor = null 
    localStorage.setItem('userInfo','{"uid":"59b3c5e3ed5e691e24793a29","uname":"王广宏","gender":"男","token":"ybLQC8G88LOhVvGTzg68Qg==","token_expires_in":36000,"clientID":"666d6bad97d847779bd955a3f97c1b9a"}')


    var img_car_flameout = new Image();
    var img_car_moving = new Image();
    var img_car_alarm = new Image();
    var img_car_overspeed = new Image();
    var car_flameout = 'assets/images/car_stop_32x32.png',      //熄火状态,gps不在线
        car_moving = 'assets/images/car_move_32x32.png',        //行进中
        car_alarm = 'assets/images/alarm_car.png',              //报警
        car_overspeed = 'assets/images/car_danger_32x32.png';   //超速
    img_car_flameout.src = car_flameout;
    img_car_moving.src = car_moving;
    img_car_alarm.src = car_alarm;
    img_car_overspeed.src = car_overspeed;

    var mapv_car_move = [];

    var videoPlayBoxes_list = [],
        videoParams_list = [];


    var carClientY = 0
    var carClientX = 0
    var vHtCarInfo = new HashTable();
    var vIsFirstLoad = true;
    var mapvLayers_car = null;
    var mapvLayersData_car = null;
    
    var mapvLayersOptions_car = {     //海量点options
        draw: 'icon',
        width: 32,
        height: 32,
        size: 32,                       // 添加点击事件时候可以用来设置点击范围
        methods: {
            click: function (item) {   //点击车辆,获取其任务,绘制任务轨迹,展示任务人员,资产等信息
                if (item) {
                    $("#lineUl").html()
                    BDMap.showInfoWindow(item);
                }
            }
        }
    };

    // $('body').click(function(even){
    //   console.log(even)
    //   $("#carInfoWindow").css({
    //     top:even.clientY+'px',
    //     left:even.clientX+'px'
    //   })
    // })

  // 点击Marker
  function clickMarker(e){
    var item = e.target
    if (item) {
      carClientY = e.clientY
      carClientX = e.clientX
      $("#lineUl").html()
      BDMap.showInfoWindow(item);
    }
  }

    var BDMap = {
        map: null,//百度地图实例
        DEFAULT_MAP_CENTER : new BMap.Point(107.16258, 34.371824),
        DEFAULT_MAP_LEVEL: 16,//地图默认显示级别
        ol_rectangle: null,//覆盖物-矩形选择框的实例
        rightclickPoint: null,
        mapvLayers: {//mapv图层
            data: [],
            escortVehicles: [],//押运车
            branches: []//  网点
        },
        infoWindows: {//信息窗口
            options: {
                enableMessage: false,
                enableAutoPan: false
            },
            focus: new BMap.InfoWindow('<span style="font-size:24px;"><h1 style="color:red;font-size:24px;">↓我在这儿↓</h1></span>', this.options)
        },
        drawVedioList: function(deviceName,j) {
            //渲染视频播放DOM
            var videoPlayListBoxResult = '';
            /*if(_videoService.isAvailable === false){
                videoPlayListBoxResult = DOM.other.noData.set({msg:'视频服务异常,请稍后再试!'});
            }else */if(videoPlayBoxes_list.length > 0){
                videoPlayListBoxResult = videoPlayBoxes_list;
            }else{
                videoPlayListBoxResult = DOM.other.noData.set({msg:'暂无视频!'});
            }

            var _box = $('#right-video-list #right-video-list-box');
            if( !(j % 2 == 0) ){
                var _box_html = '<div class="video-item"><p>'+deviceName+'</p></div>'
                _box.append(_box_html)
            }
            _box.find('.video-item').last().append(videoPlayListBoxResult)
            DATA.videoService.show(videoParams_list);
        },
        loadVedioList: function (data) { 
            
            console.table(data)
            var j = 0;

            for (var i = 0; i < data.length; i++) { 
                var data_original = data[i].original;
                
                var deviceName = data_original.deviceName;
               // console.log(deviceName)  ;
                $.when(DATA.getCarVideo(data_original),deviceName)
                    .done(function (res,deviceName) { 
                        if (res && res.length > 0) {
                            res.forEach(function (camera) {
                                console.log(camera.acc)  
                                j++;
                                videoPlayBoxes_list = DOM.other.videoPlayListBox.set(j);
                                videoParams_list = [{
                                    "id": camera.acc,
                                    "pwd": camera.pwd,
                                    "profile": 'hd',
                                    "playBox": 'play-list-box-' + j  
                                }];
                                BDMap.drawVedioList(deviceName,j)

                            });   
                        }
                    })

                // (function(data_original){
                //     var _deviceName = data_original.deviceName
                //     //console.log(data_original)
                //     $.when(DATA.getCarVideo(data_original),_deviceName)
                //     .done(function (res,_deviceName) {
                //         if (res && res.length > 0) {
                //             for(var j in res){
                //                 var camera = res[j]
                                
                //                 //j++;
                //                 videoPlayBoxes_list = DOM.other.videoPlayListBox.set(j);
                //                 videoParams_list = [{
                //                     "id": camera.acc,
                //                     "pwd": camera.pwd,
                //                     "profile": 'hd',
                //                     "playBox": 'play-list-box-' + j  
                //                 }];
                //                 BDMap.drawVedioList(_deviceName,j)
                //             }
                //             // res.forEach(function (camera) {
                                

                //             // });   
                //         }
                //     })

                // })(data_original)
                

            }
        },
        getVedioList: function (pno) {
            
              console.log('loadVedioList  start..')
              // 按车速降序排列
              var sortedData = _.sortBy(DATA.escortVehicles.all, function(item){
                return -Number(item.speed);
              });
              // 再按照是否报警排序
              sortedData = _.sortBy(sortedData, function(item){
                return item.alarm;
              });
              var gps_data = sortedData

            if (gps_data && gps_data.length > 0) {

                var num = gps_data.length;//所有记录数
                var totalPage = 0;//总页数
                var pageSize = 5;//每页显示行数
                var currentPage = pno||1;//当前页数

                //总共分几页
                if(num/pageSize > parseInt(num/pageSize)){
                    totalPage=parseInt(num/pageSize)+1;
                }else{
                    totalPage=parseInt(num/pageSize);
                }

                BDMap.mapvLayers.data = [];
                mapv_car_move = [];

                for (var i = 0; i < gps_data.length; i++) {
                    (function (k) {
                        mapv_car_move.push({
                            original: gps_data[k]
                        });
                    })(i);
                }
            }
            
            for (var i = 0; i < mapv_car_move.length; i++) {
                (function (k) {
                    for(var j in DATA.escortVehicles.selected){
                        var rows2 = DATA.escortVehicles.selected[j]
                        if(mapv_car_move[k]['original']._id==rows2.classify.imei){
                            mapv_car_move[k]['original']['car_id']=rows2._id 
                            
                        }
                    }
                })(i);
            }

            var start = ( currentPage - 1 ) * pageSize;
            var end = currentPage * pageSize;
            mapv_car_move = mapv_car_move.slice(start,end);
            

            var tempStr = "共&nbsp;<span style='color: #FFD77E'>"+totalPage+"</span>&nbsp;页&nbsp;&nbsp;当前第<span style='color: #FFD77E'>&nbsp;"+currentPage+"&nbsp;</span>页";
            if(currentPage>1){
                tempStr += "&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:void(0)' id=\"firstBtn\" data-page=\"1\">首页</a>&nbsp;&nbsp;";
                tempStr += "<a href='javascript:void(0)' id=\"preBtn\" data-page=\""+(currentPage-1)+"\"><上一页</a> "
            }else{
                tempStr += "&nbsp;&nbsp;&nbsp;&nbsp;首页&nbsp;&nbsp;";
                tempStr += "<上一页";
            }

            if(currentPage<totalPage){
                tempStr += " <a href='javascript:void(0)' id=\"nextBtn\" data-page=\""+(currentPage+1)+"\">下一页></a> ";
                tempStr += " <a href='javascript:void(0)' id=\"endBtn\" data-page=\""+(totalPage)+"\">尾页</a> ";
            }else{
                tempStr += " 下一页> ";
                tempStr += " 尾页 ";
            }

            document.getElementById("right-video-list-bottom").innerHTML = tempStr;

            $('#right-video-list #right-video-list-box').children().remove();
            BDMap.loadVedioList(mapv_car_move)
           // console.table(mapv_car_move)    
        },
        draw: function () {//绘制所有车辆1
            
            var gps_data = DATA.escortVehicles.all,
                gps_pre_data = DATA.escortVehicles.preAll;
                //gps_pre_data = DATA.escortVehicles.oldAllPosition;
                //console.table(gps_data)  
                //console.table(gps_pre_data)  

            // 清除地图上的网点
            BDMap.clearBranches();

            // if (gps_data && gps_data.length > 0) {
                
            //     BDMap.mapvLayers.data = [];
            //     mapv_car_move = [];
            
            //     for (var i = 0; i < gps_data.length; i++) {
            //         (function (k) {
            //             var car_icon = "",
            //                 car_deg = 0,
            //                 mapv_count = 0,
            //                 speed = Number(gps_data[k].speed);
            
            //             if(gps_data[k].alarm){
            //                 car_icon = img_car_alarm;
            //                 mapv_count = 100;
            //             }else if (gps_data[k].accStatus === "0" || speed === 0) {  //车辆未点火,GPS不在线,将速度置为0
            //                 car_icon = img_car_flameout;
            //                 speed = 0;
            //                 mapv_count = 80;
            //             } else if (speed > 0 && speed <= shendun.global.SPEED_LIMIT && gps_data[k].status === "1") {     //车速小于限速,且GPS在线,即正常行驶中
            //                 //alert('lll') 
            //                 car_icon = img_car_moving;  
            //             } else if(speed > shendun.global.SPEED_LIMIT) {                            //超速车辆
            //                 DATA.overspeedLog.add(gps_data[k]);
            //                 car_icon = img_car_overspeed;
            //                 mapv_count = 90;
            //             }
            
            //             //设置车头角度
            //             if(_.isEmpty(gps_pre_data)){
            //                 car_deg = 0;
            //             }else{
            //                 var _car = _.find(gps_pre_data, {"_id": gps_data[k]._id});
            //                 if(gps_data[k].alarm){      //报警车辆不进行角度旋转，永远是正视角
            //                     car_deg = 0;
            //                 }else if(_car.lng === gps_data[k].lng && _car.lat === gps_data[k].lat){
            //                     car_deg = _car.rotate || 0;
            //                 }else{
            //                     car_deg = BDMap.carRotation(_car, gps_data[k]);
            //                 }
            //                 _car.rotate = car_deg;
            //             }
            //             BDMap.mapvLayers.data.push({
            //                 original: gps_data[k],
            //                 geometry: {
            //                     type: 'Point',
            //                     coordinates: [gps_data[k].lng, gps_data[k].lat]  
            //                 },
            //                 count: mapv_count,   // 权重
            //                 deg: car_deg,
            //                 icon: car_icon
            //             });
            
            //             if(speed > 0 && gps_data[k].accStatus === "1"){
            //                 mapv_car_move.push({
            //                     original: gps_data[k]
            //                 })
            //             }
            //         })(i);
            //     }
            
            //     //清除原图层, 海量点无法单独清除, 只能一次性清除一批mapvLayers
            //     //BDMap.clearEscortVehicles();
            //     if(!mapvLayers_car) {
            //         mapvLayersData_car = new mapv.DataSet(BDMap.mapvLayers.data);
            //         mapvLayers_car = new mapv.baiduMapLayer(BDMap_map, mapvLayersData_car, mapvLayersOptions_car);
            //         BDMap.mapvLayers.escortVehicles.push(mapvLayers_car);
            //     }else{
            //         mapvLayersData_car.set(BDMap.mapvLayers.data);
            //     }
            
            //     //BDMap.loadVedioList(mapv_car_move);
            // }

            // BDMap.clearEscortVehicles();
            // 一次性清除覆盖物
            //BDMap_map.clearOverlays();//20190117临时   

          // 使用路书重写车辆行进平滑轨迹
            //20190123
            if(gps_pre_data && gps_pre_data.length>0){//有老数据
                //console.log('hasOld')
                if(gps_data && gps_data.length > 0) { 
                    for(var i = 0;i<gps_data.length;i++){
                      (function (k) {
                        var item = gps_data[k]
                        var deviceName = item.deviceName//老数据车辆名称
                        
                        var point = new BMap.Point(item.lng, item.lat)//车辆新坐标
                        var oldItem = _.find(gps_pre_data, {"_id": item._id})
                        var oldPoint = new BMap.Point(oldItem.lng, oldItem.lat)//车辆旧坐标
                        var car_icon = "",
                            speed = Number(item.speed* 5 / 18); 
                        // 驾车路线搜索
                        
                        var driving =new BMap.DrivingRoute(BDMap_map, {//创建一个驾车导航实例
                          onSearchComplete: function(results){//检索完成回掉  results: DrivingRouteResult
                             //console.log(results)
                             BDMap.ClearOverByDeviceName2(deviceName);
                            //  BMapLib.LuShu.prototype._addMarker = function (res) {
                            //     if (this._marker) {    
                                    
                            //         this.stop();
                            //         this._map.removeOverlay(this._marker);
                            //         clearTimeout(this._timeoutFlag);
                            //     }
                            //     //console.log(vIsFirstLoad) 
                            //     //移除之前的overlay
                            //     //this._overlay && this._map.removeOverlay(this._overlay);
                            //     //var _carInfo = this._opts._carInfo;
                            //     var bPoint = point;
                            //     var ePoint = oldPoint;
                            //     var marker = new BMap.Marker(bPoint);  
                            //     //console.log(marker)
                            //     var vRotation = BDMap.carRotation(bPoint, ePoint);
                            //     marker.setRotation(vRotation);
                            //     this._opts.icon && marker.setIcon(this._opts.icon);
                            //     //if(i==) 
                            //     //console.log(i) 
                            //     //this._map.addOverlay(marker);//每次添加坐标点   
                            //     // if(vIsFirstLoad){
                                    
                            //     //     this._map.addOverlay(marker);
                                   
                                    
                            //     //     if(i==78){
                            //     //         vIsFirstLoad = false  
                            //     //     }
                            //     // }
                                 
                            //     //marker.setTitle(_carInfo.deviceName);
                            //     this._marker = marker;
                            // }


                            if (driving.getStatus() == BMAP_STATUS_SUCCESS) {
                                //假如车辆报警
                              // 地图覆盖物
                              var points = results.getPlan(0).getRoute(0).getPath();//第一个方案的第一条线路的坐标点集合
                              var dis = results.getPlan(0).getRoute(0).getDistance(false)//仅返回路线距离数据
                            //    var polyline = new BMap.Polyline(points);
                            //    BDMap_map.addOverlay(polyline);
                              var delay = $(DOM.footer.tip.refresh.clazz).val() / 1000;//计时器，s
                              var lushu = new BMapLib.LuShu(BDMap_map, points, {
                                defaultContent: '',//deviceName
                                markerOption:item  ,
                                clickMarker:clickMarker,  
                                //autoView: true, // 是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                                icon: new BMap.Icon('./assets/images/car_move_32x32.png', new BMap.Size(32, 32), {anchor: new BMap.Size(15, 15)}),
                                enableRotation: true, //是否设置marker随着道路的走向进行旋转  
                                speed: parseInt(dis / (delay+3.5)), //速度，单位米每秒delay-4              
                                landmarkPois:[]
                              })
                              lushu.start()
                              
                              item = null
                              point = null 
                              oldItem = null
                              oldPoint = null
                              speed = null
                            }
                          }
                        });
    
                        // 停止 或熄火的直接使用marker
                        if(item.alarm){
                            car_icon = img_car_alarm;
                            var myIcon = new BMap.Icon(car_icon, new BMap.Size(32,32));
                            var marker2 = new BMap.Marker(point,{icon:myIcon});  // 创建标注
                            marker2.original = item;
                            marker2.addEventListener("click",clickMarker);
                            BDMap.ClearOverByDeviceName2(deviceName);
                            BDMap_map.addOverlay(marker2);  
                        }else if(item.accStatus === "0" || speed === 0){  //车辆未点火,GPS不在线,将速度置为0
                            car_icon = car_flameout;
                            speed = 0;
                            var myIcon = new BMap.Icon(car_icon, new BMap.Size(32,32));
                            var marker2 = new BMap.Marker(point,{icon:myIcon});  // 创建标注
                            marker2.original = item;
                            marker2.addEventListener("click",clickMarker);
                            BDMap.ClearOverByDeviceName2(deviceName);
                            BDMap_map.addOverlay(marker2);
                        }else if (speed > 0 && speed <= shendun.global.SPEED_LIMIT && item.status === "1"){  //车速小于限速,且GPS在线,即正常行驶中
                           // console.log('dadas')
                             if(item.lng==oldItem.lng&&item.lat==oldItem.lat){

                             }else{
                               // console.log('run') 
                                driving.search(oldPoint, point);
                                  
                             }
                          
                        }else if(speed > shendun.global.SPEED_LIMIT){    //超速车辆
                            if(item.lng==oldItem.lng&&item.lat==oldItem.lat){

                            }else{
                               driving.search(oldPoint, point);
                            } 
                        }
    
                      })(i);
    
    
                    }
                }


            }else{
               // console.log('nothasOld')
                // 如果没有老数据 直接添加标记
              if(gps_data && gps_data.length > 0) {
                for(var i = 0;i<gps_data.length;i++){
                    var item = gps_data[i]
                    var point = new BMap.Point(item.lng, item.lat)
                    var car_icon = "",
                        speed = Number(item.speed);
                    //创建车标
                  if(item.alarm){
                    car_icon = img_car_alarm;
                  }else if (item.accStatus === "0" || speed === 0) {  //车辆未点火,GPS不在线,将速度置为0
                    car_icon = car_flameout;
                    speed = 0;
                  } else if (speed > 0 && speed <= shendun.global.SPEED_LIMIT && item.status === "1") {     //车速小于限速,且GPS在线,即正常行驶中
                    car_icon = car_moving;
                  } else if(speed > shendun.global.SPEED_LIMIT) {                            //超速车辆
                    DATA.overspeedLog.add(item);
                    car_icon = car_overspeed;
                  }
                    var myIcon = new BMap.Icon(car_icon, new BMap.Size(32,32));
                    var marker2 = new BMap.Marker(point,{icon:myIcon,title:item.deviceName});  // 创建标注
                    marker2.original = item;
                    marker2.addEventListener("click",clickMarker);
                    BDMap_map.addOverlay(marker2);//第一次将所有车辆绘制图中
                }
              }
            }






            //只有一辆车时,将地图中心定位到该车所在位置, 地图缩放比例使用默认值
            // if (gps_data.length === 1) {
            //     BDMap_map.centerAndZoom(new BMap.Point(gps_data[0].lng, gps_data[0].lat), BDMap.DEFAULT_MAP_LEVEL);
            // }
        },
        //执行绘制车辆运行---heyun
        InitDrawCarInfo: function () {
            var vDrive;
            var vGpsAll = DATA.escortVehicles.all;
            var vHtResult = BDMap.DealGPSData(vGpsAll);
            var poiStart;// 起点
            var poiEnd; //终点
            var vHtValue = vHtResult.getValues();//转化成数组
            var vLen = vHtValue.length;//加载车辆个数
            //console.log(vHtValue)
            var vTempValue;
            var vTempLng, vTempLat;

            for (var i = 0; i < vLen; i++) {
                vTempValue = vHtValue[i];//单个车辆数据
                //console.log(vIsFirstLoad)
                if (vTempValue._lng == vTempValue.lng && vTempValue._lat == vTempValue.lat && !vIsFirstLoad) {
                    continue;//判断是否为第一次加载和坐标是否变化
                }
                // if (vTempValue._id == "868120202591365") {
                poiStart = new BMap.Point(vTempValue._lng, vTempValue._lat);
                poiEnd = new BMap.Point(vTempValue.lng, vTempValue.lat);
                BDMap.CarRun(poiStart, poiEnd, vTempValue,i);
                
                // }
            }
            //vIsFirstLoad = false;
        },

        //车辆开始跑了---heyun
        CarRun: function (pStart, pEnd, vCarInfoValue,i) {
            var drv = new BMap.DrivingRoute(pStart, {
                onSearchComplete: function (res) {
                    if (drv.getStatus() === BMAP_STATUS_SUCCESS) {
                        var plan = res.getPlan(0);
                        var arrPois = [];
                        var vNumRoutes = plan.getNumRoutes();
                        var vRoute;
                        for (var j = 0; j < vNumRoutes; j++) {
                            vRoute = plan.getRoute(j);
                            arrPois = arrPois.concat(vRoute.getPath());
                        }
                        //this._map.removeOverlay(this._marker);   
                        BMapLib.LuShu.prototype._addMarker = function (res) {
                            if (this._marker) {    
                                
                                this.stop();
                                this._map.removeOverlay(this._marker);
                                clearTimeout(this._timeoutFlag);
                            }
                            //console.log(vIsFirstLoad) 
                            //移除之前的overlay
                            //this._overlay && this._map.removeOverlay(this._overlay);
                            var _carInfo = this._opts._carInfo;
                            var bPoint = new BMap.Point(_carInfo.lng, _carInfo.lat);
                            var ePoint = this._path[0];
                            var marker = new BMap.Marker(bPoint);  
                            //console.log(marker)
                            var vRotation = BDMap.carRotation(bPoint, ePoint);
                            marker.setRotation(vRotation);
                            this._opts.icon && marker.setIcon(this._opts.icon);
                            //if(i==) 
                            //console.log(i)
                            this._map.addOverlay(marker);//每次添加坐标点
                            // if(vIsFirstLoad){
                                
                            //     this._map.addOverlay(marker);
                               
                                
                            //     if(i==78){
                            //         vIsFirstLoad = false  
                            //     }
                            // }
                             
                            marker.setTitle(_carInfo.deviceName);
                            this._marker = marker;
                        }
                            //  var polyline = new BMap.Polyline(arrPois); 
                            //  BDMap_map.addOverlay(polyline);
                        //if(DATA.loadTime == 1){
                            BDMap.ClearOverByDeviceName(drv.carInfo.deviceName);
                        //}
                        //DATA.loadTime++
                        var vCarStatusImg;
                        if (drv.carInfo.accStatus === "1") vCarStatusImg = car_moving;
                        else vCarStatusImg = car_flameout;

                        var lushu = new BMapLib.LuShu(BDMap_map, arrPois, {
                            defaultContent: "",//"从天安门到百度大厦"
                            autoView: false,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                            icon: new BMap.Icon(vCarStatusImg, new BMap.Size(32, 32), { anchor: new BMap.Size(21, 13) }),
                            speed: BDMap.CalCarRunSpeed(drv.carInfo),  
                            enableRotation: true,
                            landmarkPois: [],
                            _carInfo: drv.carInfo
                        });
                        lushu.start();
                    }
                }
            });
            drv.search(pStart, pEnd);
            drv.carInfo = vCarInfoValue;//vCarInfoValue.deviceName;
        },

        //计算车子的跑的速度
        CalCarRunSpeed: function (vCarGPSInfo) {
            var vBeginTime = new Date((vCarGPSInfo._gpsTime).replace(/-/g, "/"));
            var vEndTime = new Date((vCarGPSInfo.gpsTime).replace(/-/g, "/"));
            var vDateDiff = vEndTime.getTime() - vBeginTime.getTime();//相差的毫秒数
            var vSpeed;
            if (vDateDiff == 0) vSpeed = 0;
            else {
                var pBegin = new BMap.Point(vCarGPSInfo._lng, vCarGPSInfo._lat);
                var pEnd = new BMap.Point(vCarGPSInfo.lng, vCarGPSInfo.lat);
                var vDistance = parseInt(BDMap_map.getDistance(pBegin, pEnd)) + 1;
                if (vDateDiff >= 10000) vSpeed = Math.ceil(vDistance / 4);
                else vSpeed = Math.ceil((vDistance * 1000) / vDateDiff);
            }
            return vSpeed;
        },

        //根据车名清楚车的覆盖物---heyunoriginal
        ClearOverByDeviceName2: function (deviceName) {
           // console.log('clear')
           // console.log(BDMap_map.getOverlays())
            var allOverlay = BDMap_map.getOverlays();
            
            var vLen = allOverlay.length ;
            for (var i = 0; i < vLen; i++) { 
                
                try {
                    if (allOverlay[i].original.deviceName == deviceName) {
                       //console.log(allOverlay[i].getRotation())
                        BDMap_map.removeOverlay(allOverlay[i]);
                        
                        return false;
                    }
                }
                catch (ex) {
                    var ss = ex;

                }
            }
        },
        ClearOverByDeviceName: function (deviceName) {
            
            var allOverlay = BDMap_map.getOverlays();
           
            var vLen = allOverlay.length - 1;
            for (var i = 0; i < vLen; i++) {
               // console.log(allOverlay[i])
                try {
                    if (allOverlay[i].getTitle() == deviceName) {
                        BDMap_map.removeOverlay(allOverlay[i]);
                        
                        return false;
                    }
                }
                catch (ex) {
                    var ss = ex;

                }
            }
        },
        

        //处理GPS数据以便于好处理---heyun
        DealGPSData:function(vGPSData) {
            var vGPSLen = vGPSData.length;
            var vTempGPS;
            var vTempLastGPS;
            for (var i = 0; i < vGPSLen; i++) {
                vTempGPS = vGPSData[i];
                //console.log(vTempGPS)  
                if (vHtCarInfo.containsKey(vTempGPS._id)) {
                    vTempLastGPS = vHtCarInfo.getValue(vTempGPS._id);
                    vTempGPS._lng = vTempLastGPS.lng;
                    vTempGPS._lat = vTempLastGPS.lat;
                    vTempGPS._gpsTime = vTempLastGPS.gpsTime;
                    vHtCarInfo.remove(vTempGPS._id);
                    vHtCarInfo.add(vTempGPS._id, vTempGPS);
                }
                else {
                    vTempGPS._lng = vTempGPS.lng;
                    vTempGPS._lat = vTempGPS.lat;
                    vTempGPS._gpsTime = vTempGPS.gpsTime;
                    vHtCarInfo.add(vTempGPS._id, vTempGPS);
                }
            }
            return vHtCarInfo;
        },

        //显示一辆车的运行线路 ---heyun
        ShowOneCarRunRoute: function () {
            var vEndDate = new Date("2018-11-13 23:59:59").getTime();
            var vBeginDate = new Date("2018-11-13 00:00:00").getTime();
            var vURL = "gps/getTracks/868120171603050/" + vBeginDate + "/" + vEndDate;
            var request = new shendun.util.request();
            $.when(request.Get(vURL, {}))
                .done(function (data) {
                    if (data.message == "success") {
                        BDMap.DrawOnCarRunLine(data.result);
                    }
                });
        },

        //画一辆车的运行路线
        DrawOnCarRunLine: function (vResult) {
            vResult = BDMap.ParseCoords(vResult);
            var vLen = vResult.length-1;
            var vTempGPS1, vTempGPS2;
            var vLinePoint = new Array();
            var polyline;
            for (var i = 0; i < vLen; i++) {
                vLinePoint = [];
                vTempGPS1 = vResult[i];
                vTempGPS2 = vResult[i+1];
                vLinePoint.push(new BMap.Point(vTempGPS1.lng, vTempGPS1.lat));
                vLinePoint.push(new BMap.Point(vTempGPS2.lng, vTempGPS2.lat));
                polyline = new BMap.Polyline(vLinePoint, {
                    strokeColor: "green",
                    strokeWeight: 1,
                    strokeOpacity: 1
                });
                BDMap_map.addOverlay(polyline);
            }
         
        },

        //坐标转换
        ParseCoords: function (vOrginCoords) {
            if (vOrginCoords) {
                var gcj02, bd09;
                var vLen = vOrginCoords.length;
                for (var i = 0; i < vLen; i++) {
                    gcj02 = coordtransform.wgs84togcj02(vOrginCoords[i].lng, vOrginCoords[i].lat);
                    bd09 = coordtransform.gcj02tobd09(gcj02[0], gcj02[1]);
                    vOrginCoords[i].lng = bd09[0];
                    vOrginCoords[i].lat = bd09[1];
                }
            }
            return vOrginCoords;
        },


        showInfoWindow: function(item, tabIndex){
            var data = item.original,
                tabItem0Class = "am-active",
                tabItem1Class = "",
                lonLat = data.lng + "," + data.lat,
                postType = data.postType || 'GPS',   //目前只有一种定位方式,考虑到接口效率,后端接口不再返回postType字段,前端默认使用GPS
                videoPlayBoxes = [],
                videoParams = [];

            //获取视频数量, 渲染 playbox的DOM,供msdk插入视频进行播放
            $.when(DATA.getCarVideo(data))
                .done(function(res){
                    if(res && res.length>0){
                        var i = 0;
                        res.forEach(function (camera) {
                            i++;
                            videoPlayBoxes.push(DOM.other.videoPlayBox.set(i));
                            videoParams.push({
                                "id": camera.acc,
                                "pwd": camera.pwd,
                                "profile": 'hd',
                                "playBox": 'play-box-'+i
                            });
                        });
                    }
                })
                .always(function(_videoService){
                    var getCarTasksParams = {
                        filter: {"goods": {"$elemMatch": {"name": data.deviceName}}, "Date":  new Date().format("yyyy-MM-dd")}
                    };
                    //根据车牌号和日期查询其任务
                    $.when(request.Post("common/find/task", getCarTasksParams))
                        .always(function(tasksData){
                            DATA.currentTask.data = tasksData;
                            //根据地理坐标获取街道信息w
                            var geoc = new BMap.Geocoder();
                            geoc.getLocation(new BMap.Point(data.lng, data.lat), function (rs) {
                                var addComp = rs.addressComponents;
                                var currAddress = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                                $(".js-curr-address").html('位置：'+currAddress);
                               // $(".js-curr-address").append(currAddress);
                            });

                            //渲染视频播放DOM
                            var videoPlayBoxResult = '';
                            $(".J_deviceName").html(data.deviceName)
                            if(_videoService.isAvailable === false){
                                videoPlayBoxResult = DOM.other.noData.set({msg:'视频服务异常,请稍后再试!'});
                              $("#carVideoA").html('视频服务异常,请稍后再试!')
                              $("#carVideoB").html('视频服务异常,请稍后再试!')
                              $("#tabCarVideoA").html('视频服务异常,请稍后再试!')
                              $("#tabCarVideoB").html('视频服务异常,请稍后再试!')
                            }else if(videoPlayBoxes.length > 0){
                                videoPlayBoxResult = videoPlayBoxes.join('');
                                // 设置AB摄像头
                              $("#carVideoA").html(videoPlayBoxes[0])
                              $("#carVideoB").html(videoPlayBoxes[1])

                              $("#tabCarVideoA").html(videoPlayBoxes[0])
                              $("#tabCarVideoB").html(videoPlayBoxes[1])
                            }else{
                              $("#carVideoA").html('')
                              $("#carVideoB").html('')
                              $("#tabCarVideoA").html('')
                              $("#tabCarVideoB").html('')
                                videoPlayBoxResult = DOM.other.noData.set({msg:'暂无视频!'});
                            }

                            // 实例化一个驾车导航, 用来绘制任务路线
                            // _.forEach(DATA.currentTask.data, function(taskItem, index){
                            //     var sortedTaskItemLines = _.sortBy(taskItem.lines, "no"),
                            //         taskLineColor = ['#640CAB','#8BEA00', '#33CCCC', '#E6399B'];    // 线路颜色
                            //
                            //     var task_line;
                            //     var drv = new BMap.DrivingRoute('宝鸡', {
                            //         onSearchComplete: function(res) {
                            //             if (drv.getStatus() == BMAP_STATUS_SUCCESS) {
                            //                 var arrPois = res.getPlan(0).getRoute(0).getPath();
                            //                 BDMap_map.addOverlay(new BMap.Polyline(arrPois, {strokeColor: taskLineColor[index]}));
                            //                 BDMap_map.setViewport(arrPois);
                            //
                            //                 task_line = new BMapLib.LuShu(BDMap_map, arrPois,{
                            //                     // autoView:false,//是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                            //                     // icon  : new BMap.Icon('assets/images/car_move_32x32.png', new BMap.Size(32,32),{anchor : new BMap.Size(32, 32)}),
                            //                     // speed: Number(data.speed) * 5 / 18,    //x为时速, speed单位是米/秒
                            //                     // enableRotation:false,//是否设置marker随着道路的走向进行旋转
                            //                     /*landmarkPois: [
                            //                         {lng:116.314782,lat:39.913508,html:'加油站',pauseTime:2}
                            //                     ]*/
                            //                 });
                            //             }
                            //         }
                            //     });
                            //
                            //     //点与点逐个绘制
                            //     for(var i = 0; i < sortedTaskItemLines.length-1 ; i++){
                            //         (function(j){
                            //             var branchItem = sortedTaskItemLines[j],
                            //                 startCoordinate = branchItem.coordinates,
                            //                 endCoordinate = sortedTaskItemLines[j+1].coordinates;
                            //
                            //             if(endCoordinate[0] != 0 && endCoordinate[1] !=0 && startCoordinate[0] !=0 && startCoordinate[1] != 0){
                            //                 var endPosition = new BMap.Point(endCoordinate[0],endCoordinate[1]),   //任务的最后一个网点坐标
                            //                     startPosition = new BMap.Point(startCoordinate[0],startCoordinate[1]);   //任务的第一个网点坐标
                            //                 drv.search(startPosition, endPosition);
                            //             }
                            //         })(i);
                            //     }
                            // });


                            var _domResult = DOM.infoPanel.tmp
                                .replace(/@imei@/g, data._id)
                                .replace(/@clientId@/g, DATA.userInfo.clientID)
                                .replace(/@token@/g, DATA.userInfo.token)
                                .replace(/@hidden@/g, "hidden")
                                .replace(/@am-in@/g, "am-in")
                                .replace(/@private-style@/g, "infowindow-limit-height")
                                .replace(/@device-name@/g, data.deviceName)
                                .replace(/@device-imei@/g, data.imei)
                                .replace(/@arrow@/g, "")
                                .replace(/@list-status@/g, "")
                                .replace(/@tab-item-0-class@/g, tabItem0Class)
                                .replace(/@lon-lat@/g, lonLat)
                                .replace(/@tab-item-1-class@/g, tabItem1Class)
                                .replace(/@gps-time@/g, data.gpsTime)
                                .replace(/@post-type@/g, postType)
                                .replace(/@lng@/g, data.lng)
                                .replace(/@lat@/g, data.lat)
                                .replace(/@speed@/g, data.speed)
                                .replace(/@tabCarVideoA@/g, videoPlayBoxes[0] || '')
                                .replace(/@tabCarVideoB@/g, videoPlayBoxes[1] || '')
                                .replace(/@tabTaskShow@/g, DATA.currentTask.data[0] ? DATA.currentTask.data[0].LineName + DATA.currentTask.data[0].EmuName + DATA.currentTask.data[0].TaskType : '')
                            ;
                            var opts = {
                                title: "", // 信息窗口标题
                                width: 730,
                                height: 750,
                                enableAutoPan:false
                            };


                            $("#carInfoWindow").html(_domResult).show()

                            $("#closeCarInfo").click(function(){
                              $("#carInfoWindow").hide()
                            })

                            // 发送消息
                            $("#sendMsgBtn").click(function(){
                              $("#tab-locations").text()
                              $("#sendMsgForm").modal({
                                relatedTarget: this,
                                onConfirm: function(options) {
                                  var phoneNum = $('#sendmsg-phone').val();
                                  var text = $("#tab-locations").text()
                                  // TODO 发送短信
                                },
                                onCancel: function() {

                                }
                              })
                            })

                            // var lng = data.lng
                            // var lat = data.lat
                            // BDMap_map.openInfoWindow(new BMap.InfoWindow(_domResult, opts), new BMap.Point(lng, lat));
                            //点击车辆,获取其任务,绘制任务轨迹,展示任务人员,资产等信息
                            DATA.escortVehicles.loadTaskInfo(data._id);

                            // 根据tabIndex参数，自动打开指定的tab content
                            // if(tabIndex && _.isNumber(tabIndex) && tabIndex >= 0 && tabIndex < $("."+DOM.infoPanel.controlDoms.infoPanelTabsNav).find("li").length){
                            //     $("."+DOM.infoPanel.controlDoms.infoPanelTabsNav+" li").eq(tabIndex).addClass("am-active").siblings().removeClass("am-active");
                            //     $("."+DOM.infoPanel.controlDoms.infoPanelTabsNav).next(".am-tabs-bd").find(".am-tab-panel").eq(tabIndex).addClass("am-active am-in").siblings().removeClass("am-active am-in");
                            // }
                            DATA.videoService.show(videoParams);
                        });
                });
        },
        clearEscortVehicles: function () {  //清除车辆
            for (var i = 0; i < BDMap.mapvLayers.escortVehicles.length; i++) {
                BDMap.mapvLayers.escortVehicles[i].destroy();
            }
        },
        clearBranches: function () {        //清除网点
            for (var i = 0; i < BDMap.mapvLayers.branches.length; i++) {
                BDMap.mapvLayers.branches[i].destroy();
            }
        },
        drawBranches: function () {//加载网点
            
            if (DATA.leftMenu.branches.all.length > 0) {
                //清除原图层
                BDMap.clearBranches();
                //停止自动刷新车辆数据
                DATA.escortVehicles.poll.clear();

                var opts = {
                    title: "", // 信息窗口标题
                };
                var data = [];
                var options = {
                    draw: 'icon',
                    width: 32,
                    height: 32,
                    size: 32, // 添加点击事件时候可以用来设置点击范围
                    methods: {
                        click: function (item) {
                            if (item && item.original) {
                                var content = '<ul class="am-list admin-sidebar-list">' +
                                    '<li class="am-panel">'
                                    + '<i class="fa fa-university" aria-hidden="true"></i>'
                                    + item.original.class
                                    + '<ul class="am-list am-collapse admin-sidebar-sub am-in" id="details-' + item.original._id + '">'
                                    + '<div data-am-widget="tabs" class="am-tabs am-tabs-d2">'
                                    + '<ul class="am-tabs-nav am-cf wangdian">'
                                    + '<li class="am-active"><a href="[tab-' + item.original._id + '-0]">信息</a></li>'
                                    + '<li class=""><a href="[tab-' + item.original._id + '-2]" id="task-' + item.original._id + '">其他</a></li>'
                                    + '</ul>'
                                    + '<div class="am-tabs-bd">'
                                    + '<div tab-' + item.original._id + '-0 class="am-tab-panel am-active">'
                                    + '<ul>'
                                    + '<li>网点名：' + item.original.name + '</li>'
                                    + '<li>电话：' + '0917-1234567' + '<button>电话<button><button>短信<button></li>'
                                    //+ '<li>经度：' + item.original.loc.coordinates[0] + '</li>'
                                    //+ '<li>纬度：' + item.original.loc.coordinates[1] + '</li>'
                                    + '<li>经度：' + item.original.coordinates[0] + '</li>'
                                    + '<li>纬度：' + item.original.coordinates[1] + '</li>'
                                    + '<li>地址：' + item.original.address + '</li>'
                                    + '</ul>'
                                    + '</div>'
                                    + '<div tab-' + item.original._id + '-2 class="am-tab-panel">'
                                    + '<table class="am-table">'
                                    + '<tbody>'
                                    + '<tr><td>暂无数据...</td></tr>'
                                    + '</tbody>'
                                    + '</table>'
                                    + '</div>'
                                    + '</div>'
                                    + '</ul>'
                                    + '</li></ul>';

                                BDMap_map.openInfoWindow(new BMap.InfoWindow(content, opts),
                                    new BMap.Point(item.geometry.coordinates[0], item.geometry.coordinates[1]));

                                $(".BMap_bubble_content .am-tabs-nav.wangdian li>a").on("click", function (e) {
                                    var $this = $(this);
                                    e.preventDefault();
                                    $this.parent("li").addClass("am-active").siblings("li").removeClass("am-active");
                                    $this.parents(".am-tabs").find(".am-tab-panel").each(function () {
                                        $(this).removeClass("am-active");
                                    });
                                    $($this.attr("href")).addClass("am-active");
                                });
                            }
                        }
                    }
                };

                var branch_icon_path = "assets/images/bankicon/bank64/",
                    branch_icon_suffix = ".png",
                    branch_icons = [
                        {name: "中国建设银行",abbreviation: "ccb"}
                        ,{name: "中国农业银行",abbreviation: "abc"}
                        ,{name: "中国工商银行",abbreviation: "icbc"}
                        ,{name: "中国银行",abbreviation: "boc"}
                        ,{name: "中国民生银行",abbreviation: "cmbc"}
                        ,{name: "北京银行",abbreviation: "bob"}
                        ,{name: "招商银行",abbreviation: "cmb"}
                        ,{name: "兴业银行",abbreviation: "cib"}
                        ,{name: "交通银行",abbreviation: "bcm"}
                        ,{name: "中国光大银行",abbreviation: "ceb"}
                        ,{name: "广东发展银行",abbreviation: "gbd"}
                        ,{name: "中信银行",abbreviation: "citicib"}
                        ,{name: "中国邮政储蓄银行",abbreviation: "psbc"}
                        ,{name: "中国平安银行",abbreviation: "pabc"}
                        ,{name: "华夏银行",abbreviation: "hb"}
                        ,{name: "上海浦东发展银行",abbreviation: "spdb"}
                        ,{name: "西安银行",abbreviation: "bank_of_xian"}
                        ,{name: "长安银行",abbreviation: "cab"}
                        ,{name: "中国人民银行",abbreviation: "pboc"}
                        ,{name: "加油/气站",abbreviation: "gas_station_02"}
                        ,{name: "收费站",abbreviation: "toll"}
                        ,{name: "农村信用社",abbreviation: "rcc"}
                        ,{name: "金台联社",abbreviation: "rcu"}
                        ,{name: "农村商业银行",abbreviation: "bank"}     //各个地区的农村商业银行logo不一致,所以使用通用的图标
                        ,{name: "其他",abbreviation: "bank"}
                    ];

                for (var i = 0, branches = DATA.leftMenu.branches.all; i < branches.length; i++) {
                    var img_branch = new Image();

                    img_branch.src = branch_icon_path + _.result(_.find(branch_icons, {name: branches[i].class}), "abbreviation") + branch_icon_suffix;

                    data.push({
                        original: branches[i],
                        geometry: {
                            type: 'Point',  
                            coordinates: branches[i].coordinates
                        },
                        count: 30,
                        deg: 0,
                        icon: img_branch
                    });
                }   
                
                //清除原图层, 海量点无法单独清除, 只能一次性清除一批mapvLayers
                for (var c = 0; c < BDMap.mapvLayers.branches.length; c++) {
                    BDMap.mapvLayers.branches[c].destroy();  
                }
                //console.log(data[0]) 
                var data2 =  []
                if(data[0].original.class=='加油/气站'){
                    //alert('999')
                    for(var i in data){
                        if(i<169) data2.push(data[i])
                    }
                    var mapvDataSet = new mapv.DataSet(data2); 
                }else{
                    var mapvDataSet = new mapv.DataSet(data);
                }
                 
                
                var mapvLayers = new mapv.baiduMapLayer(BDMap_map, mapvDataSet, options);//TODO
                
                BDMap.mapvLayers.branches.push(mapvLayers); 
                
                if (DATA.leftMenu.branches.all.length === 1) {
                    BDMap_map.centerAndZoom(new BMap.Point(DATA.leftMenu.branches.all[0].coordinates[0], DATA.leftMenu.branches.all[0].coordinates[1]), BDMap.DEFAULT_MAP_LEVEL);
                }
                
            }
        },
        drawLines:function(){
            if(DATA.currentTask.lines && DATA.currentTask.lines.length > 0){
                var polyline = new BMap.Polyline(DATA.currentTask.linesPoints, {
                    strokeColor: "#1A6BE6",
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                });
                BDMap_map.setCenter(polyline.getBounds().getCenter());

                var setZoom = function(zoom){
                    if(zoom > 0){
                        BDMap_map.setZoom(zoom);
                        if(!BDMap_map.getBounds().containsBounds(polyline.getBounds())){
                            setZoom(--zoom);
                        }
                    }
                };
                setZoom(18);
                BDMap_map.panTo(polyline.getBounds().getCenter());
                BDMap_map.addOverlay(polyline);
                // 配置图片
                var size = new BMap.Size(48, 48);
                var offset = new BMap.Size(0, -20);
                var imageSize = new BMap.Size(48, 48);
                var iconBegin = new BMap.Icon("assets/images/begin.png", size, {
                    imageSize: imageSize
                });
                var iconEnd = new BMap.Icon("assets/images/end.png", size, {
                    imageSize: imageSize
                });
                // 画图标
                var markerBegin = new BMap.Marker(DATA.currentTask.linesPoints[0], {
                    icon: iconBegin,
                    offset: offset
                }); // 创建标注
                var markerEnd = new BMap.Marker(DATA.currentTask.linesPoints[DATA.currentTask.linesPoints.length-1], {
                    icon: iconEnd,
                    offset: offset
                }); // 创建标注
                BDMap_map.addOverlay(markerBegin);
                BDMap_map.addOverlay(markerEnd);

                var allData=[];
                for(var j=0; j<DATA.currentTask.lines.length; j++){
                    allData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [DATA.currentTask.lines[j].lng, DATA.currentTask.lines[j].lat]
                        },
                        count: 30,
                        text: j+1,
                        original:DATA.currentTask.lines[j]
                    });
                }
                var dataSet_all = new mapv.DataSet(allData);

                var options_all={
                    fillStyle: '#00FF33',
                    shadowBlur: 30,
                    methods: {
                        click: function (item) {
                            if(item && item.original){
                                BDMap_map.openInfoWindow(new BMap.InfoWindow('<p style="margin:20px 0 10px; font-size:2rem;">'+item.original.name+'</p><p style="color:#666;font-size:2rem;">'+item.original.address+'</p>',{}),
                                    new BMap.Point(item.original.lng, item.original.lat));
                            }
                        }
                    },
                    size: 3,
                    draw: 'simple'
                };

                setTimeout(function(){
                    var mapvLayer_all = new mapv.baiduMapLayer(BDMap_map, dataSet_all, options_all);
                },100);

                var iconCar = new BMap.Icon("assets/images/car_move_32_black.png", new BMap.Size(32, 32), {    //小车图片
                    //offset: new BMap.Size(0, -5),    //相当于CSS精灵
                    imageOffset: new BMap.Size(0, 0)    //图片的偏移量。为了是图片底部中心对准坐标点。
                });
                BDMap.lushu = new BMapLib.LuShu(BDMap_map,DATA.currentTask.linesPoints,{
                    defaultContent:'<span style="font-size:3em;">'+DATA.currentTask.linesPoints.name+'</span>',
                    landmarkPois: DATA.currentTask.linesPoints,
                    icon: iconCar,
                    enableRotation: true,
                    speed: 1000,
                    autoView: true
                });
            }
        },
        focus: function (lng, lat, isShowInfoWindow) {
            isShowInfoWindow = isShowInfoWindow === false ? false : true;        //true for default
            if (lng && lat) {
                var point = new BMap.Point(lng, lat);
                if(isShowInfoWindow){
                    BDMap_map.openInfoWindow(BDMap.infoWindows.focus, point);
                }
                BDMap_map.panTo(point);
            }
        },
        //车辆行进过程,车头角度调整
        // 注地图坐标系X轴向左,Y轴向下
        carRotation: function (startPoint, endPoint) {
            var x = endPoint.lng - startPoint.lng,    //lng-经度，lat-纬度
                y = endPoint.lat - startPoint.lat,
                z = Math.sqrt(x * x + y * y),
                deg = Math.round((Math.asin(y / z) / Math.PI * 180));//最终角度;
            if (x === 0 && y === 0) {
                return 0;
            }else if(x === 0){
                return -deg;
            }else if (x > 0) {
                if (deg >= 0) {
                    return 360 - deg;
                } else {
                    return -deg;
                }
            }else if (x < 0) {
                return 180 + deg;
            }
        }
    };

    DATA = {
        dunanInfo: {
            carNum:'',//车辆总数
            perNum:'',//人员总数
            alarmEndNum:'',//已处理报警数
            alarmUnNum:'',//报警带待处理数
            alarmIngNum:'',//报警处理中数
            warningNum:'',//警告日志数
            wdNum:''//网点个数
    
            
        },
        loadTime:'1',//加载次数
        deptYayun: null,
        videoService: null,
        userInfo: null,
        storeGPSAlarm: null,
        api: {
            alarm_monitor: "",
            location_monitor: "",
            chat_monitor: ""
        },
        init: function () {
            this.leftMenu.branches.load();
            this.escortVehicles.load();
            this.escortVehicles.poll.start();
            this.overspeedLog.load();
            this.overspeedLog.speedlimit.load();
            this.leftMenu.yayun.load();

            DATA.userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : {};
            DOM.header.setAccount(DATA.userInfo);

            DATA.api.alarm_monitor = shendun.global.ws_im + "?uid=" + DATA.userInfo.uid + "&groupid=alarm_monitor";      //报警监听
            DATA.api.location_monitor = shendun.global.ws_im + "?uid=" + DATA.userInfo.uid + "&groupid=location_monitor";    //位置监听
            DATA.api.chat_monitor = shendun.global.ws_im + "?uid=" + DATA.userInfo.uid + "&groupid=chat_monitor";    //聊天监听

            DATA.videoService = new shendun.util.video();
            _.delay(function(){      //msdk 不支持promise, 只能延迟登录, 如果网络不好,可以把延迟时间调大
                DATA.videoService.login(function(){
                    DATA.escortVehicles.loadVedioList(); 
                });
            },2000);

            // 建立报警消息链接
            DATA.alarmMQ.load();
        },
        parseCoords: function (original) {//坐标转换方法
            if (original) {
                if (original.lng && original.lat) {
                    var _gcj02 = coordtransform.wgs84togcj02(original.lng, original.lat);
                    var _bd09 = coordtransform.gcj02tobd09(_gcj02[0], _gcj02[1]);
                    original.lng = _bd09[0];
                    original.lat = _bd09[1];
                }
                if (original.length > 0) {
                    var gcj02 = [];
                    var bd09 = [];
                    for (var i = 0; i < original.length; i++) {
                        gcj02 = coordtransform.wgs84togcj02(original[i].lng, original[i].lat);
                        bd09 = coordtransform.gcj02tobd09(gcj02[0], gcj02[1]);
                        original[i].lng = bd09[0];
                        original[i].lat = bd09[1];
                        gcj02 = [];
                        bd09 = [];
                    }
                }
            }
            return original;
        },
        escortVehicles: {//押运车相关
            preAll: [],
            oldAllPosition: [], // 前一次请求的车辆坐标数据
            newAllPosition: [], // 当前 或最新一次请求到的车辆坐标数据
            all: [],
            selected: [],
            carList:[],//车辆列表
            poll: {
                id: null,
                start: function () {
                    var delay = $(DOM.footer.tip.refresh.clazz).val();
                    DATA.escortVehicles.poll.clear();
                    var k = 0 ;
                    DATA.escortVehicles.poll.id = setInterval(function () {
                            
                            DATA.escortVehicles.load(k); 
                            k++
                        }, parseInt(20000));// 
                },
                clear: function () {
                    clearInterval(DATA.escortVehicles.poll.id);
                },
                restart: function () {
                    var delay = $(DOM.footer.tip.refresh.clazz).val();
                    DATA.escortVehicles.poll.clear();
                    DATA.escortVehicles.load();
                    DATA.escortVehicles.poll.id = setInterval(function () {
                        DATA.escortVehicles.load();
                    }, parseInt(delay));
                }
            },
            load: function (k) {//加载押运车辆
                
                DOM.other.notification.clear();
                if (BDMap_map) {
                    var serviceURL = "gps/";
                    if (DATA.escortVehicles.selected.length > 0) {      //加载指定车辆
                        serviceURL += "getLocations/";  
                        for (var i = 0; i < DATA.escortVehicles.selected.length; i++) {

                            if (DATA.escortVehicles.selected[i].classify) {
                                serviceURL += DATA.escortVehicles.selected[i].classify.imei + ",";
                            } else {
                                serviceURL += DATA.escortVehicles.selected[i].imei + ",";
                            }
                        }
                        serviceURL = serviceURL.substr(0, serviceURL.length - 1);
                    } else {                                            //加载所有车辆
                        serviceURL += "getAllLocations";
                    }
                    if(firstLoad == 1){
                        console.log('firstLoad')
                        firstLoad = 2
                        var request_goods_car_params = {
                            filter: {type: "车辆"}
                        };
                        $.when(request.Post("common/find/goods", request_goods_car_params))
                            .done(function (data) {
                                if (data && data.length > 0) {
                                    DATA.escortVehicles.selected = data;
                        
                                }
                            }) 
                            .fail(function (xhr) {
                                // console.log(JSON.stringify(xhr));
                            });
                    }
                    $.when(request.Get(serviceURL))
                        .done(function (data) {
                            DATA.dunanInfo.carNum = data.result.length 
                            $(".data_car_num").html(DATA.dunanInfo.carNum+' 辆')
                            // var j = k%3
                            // //console.log(j) 
                            // if(typeof(k)=='undefined'){
                            //     var _result = j_data[0].result 
                            // }else{
                            //     var _result = j_data[j].result
                            // }
                            var _result = data.result;

                            

                            if(DATA.escortVehicles.selected.length > 0){//20190125 选择车辆了
                                for (var i = 0; i < _result.length; i++) {
                                    (function (k) {
                                        for(var j in DATA.escortVehicles.selected){
                                            var rows2 = DATA.escortVehicles.selected[j]
                                            if(_result[k]['imei']==rows2.classify.imei){
                                                _result[k]['car_id'] = rows2._id 
                                                
                                            }
                                        }
                                    })(i); 
                                }
                            }
                                if (_result.length === 0) {
                                    DATA.escortVehicles.all = [];
                                    //DATA.escortVehicles.oldAllPosition
                                    // DATA.escortVehicles.newAllPosition = []
                                    return;
                                }
    
                                if(!_.isEmpty(DATA.escortVehicles.all)){ 
                                    //console.log('old') 
                                  DATA.escortVehicles.oldAllPosition =JSON.parse(JSON.stringify({'data':DATA.escortVehicles.all})).data
                                  DATA.escortVehicles.preAll =JSON.parse(JSON.stringify({'data':DATA.escortVehicles.all})).data
                                  //console.log(DATA.escortVehicles.oldAllPosition)   
                                }
    
                                if(_.isEmpty(DATA.escortVehicles.preAll)){
                                    DATA.escortVehicles.preAll = _.take(DATA.escortVehicles.all, DATA.escortVehicles.all.length);
                                }else{
                                    //console.log(_result) 
                                    _.forEach(DATA.escortVehicles.preAll, function(pre_item,i){
                                        _.forEach(DATA.escortVehicles.all, function(item){
                                            //console.log(i)
                                            if(pre_item._id === item._id){
                                                _.assign(pre_item, item);
                                            }
                                        });
                                    });
                                }
                                //console.table(_result) 
                                DATA.escortVehicles.all = DATA.parseCoords(_result);
                               //DATA.escortVehicles.all = _result;
                                  
                                //console.table(DATA.escortVehicles.all)  
                                //遍历报警数据，将报警车辆状态设置为alarm: true
                                _.forEach(DATA.alarmMQ.data, function(alarmData){
                                    _.forEach(DATA.escortVehicles.all, function(escortVehicleData){
                                        if(_.eq(alarmData.content.imei, escortVehicleData.imei) && alarmData.status !== 2){
                                            escortVehicleData.alarm = true;
                                        }
                                    });
                                });
                                
                                BDMap.draw();
                                 
                                //BDMap.InitDrawCarInfo();
                                //BDMap_map.clearOverlays();
                                DOM.rightMenu.escortVehicles.update(); 
                           
                            

                            

                            
                            
                        })
                        .fail(function (xhr) {
                            console.log(JSON.stringify(xhr));
                        });
                }
            },
            loadTaskInfo: function (imei,_click_id) {
                if (_.isEmpty(imei)) {
                    return;
                }
                
                DATA.currentTask.imei = imei;

                var _data = {
                    filter: {
                         "Date": new Date().format("yyyy-MM-dd"),
                         "goods.classify.imei": imei

                    }
                };

                $.when(request.Post("common/find/task", _data))
                    .done(function (data) {
                        if (data && data.length > 0) {
                            DATA.currentTask.reset();
                            DATA.currentTask.taskArr = data

                            var carBoss = data[0].staffs.filter(function(item){
                              return item.position == '车长'
                            })[0]

                            // var carBoss = data[0].staffs.filter(function(item){
                            //   return item.position == '车长'
                            // })[0]
                            // if(typeof(carBoss.idcard)==undefined){
                            //     alert(8) 
                            // }
                            $(".js-curr-task").html('任务:'+ data[0] ? data[0].LineName + data[0].EmuName + data[0].TaskType : '')
                            $(".js-curr-carBoss").html('车长:'+ carBoss.idcard.name)
                            // $(".js-curr-carStaff").html('押运员:'+'') 


                            // _map.clearOverlays();       //清除地图上所有图标
                            for(var i=0; i<data.length; i++){
                                DATA.currentTask.lines = _.union(DATA.currentTask.lines, data[i].lines);
                                DATA.currentTask.staffs = _.union(DATA.currentTask.staffs, data[i].staffs);
                                DATA.currentTask.goods = _.union(DATA.currentTask.goods, data[i].goods);
                            }

                            DATA.currentTask.staffs = _.uniq(DATA.currentTask.staffs, 'idcard.num');
                            DATA.currentTask.goods = _.uniq(DATA.currentTask.goods, 'code');
                            // 渲染数据 车辆员工 设备 网点数据
                            $("#carTask").html('') 
                            data.forEach(function(item) { 
                              $("#carTask").append('<li class="J_carTaskItem" data-id='+item._id+'>'+item.Caption+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+item.EmuName+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+item.TaskType+'<div><input class="task-value1" value="'+item.Caption+'"/><input class="task-value2" value="'+item.EmuName+'"/><input class="task-value3" value="'+item.TaskType+'"/><span class="task-close-btn">取消</span> <span class="task-submit-btn">确认</span></div></li>')
                            })
                             var lineHtml = []
                             DATA.currentTask.lines.forEach(function(item,i){
                                var elClass = item.state === '完成' ? 'dis' : ''
                                lineHtml.push('<li class="'+elClass+'"><i></i><span>'+(i+1)+''+item.sname+'</span></li>')
                             })
                             $("#lineUl").html(lineHtml.join(''))
                            $('.J_carTaskItem').click(function (even) {
                              J_carTaskItem_index = $(this).index()//点击的任务排序
                              var datasetId = even.target.dataset.id 
                              $('.J_carTaskItem.active').removeClass('active')
                              even.target.classList.add('active')
                              var item = DATA.currentTask.taskArr.filter(function (x) {
                                return x._id == datasetId
                              })[0]
                              $("#carTaskWD").html('')
                              $("#carTaskSB").html('')
                              $("#carTaskRY").html('')
                              $("#checkerUL").html('')

                              var wdHtml = []
                              var sbHtml = []
                              var ryHtml = []
                              var checkHtml = []
                              $("#carTaskWD").attr('data-lines',JSON.stringify(item.lines))

                              if(item.lines && item.lines.length>0){
                                  for(var iew = 0;iew<item.lines.length;iew++){
                                    var lineItem = item.lines[iew]
                                    if(lineItem.checker && lineItem.checker.length>0){
                                      lineItem.checker.forEach(function(checkItem,index){
                                        checkHtml.push('<li data-id='+datasetId+'><span class="shortinfo">'+(index+1)+'</span><span class="longlonginfo">'+checkItem.name+'</span><span class="shortinfo">'+checkItem.owner+'</span></li>')
                                      })
                                    }
                                  }
                              }
 

                              item.lines.forEach(function(item,index){
                                //wdHtml.push('<li data-id='+datasetId+'><span class="shortinfo">'+(index+1)+'</span><span class="longlonginfo">'+item.sname+'</span><span class="shortinfo">'+item.behavior+'</span></li>')
                                wdHtml.push('<li data-id='+datasetId+' data-id2='+item._id+'><span class="shortinfo">'+(index+1)+'</span><input readonly name="'+item.sname+'" value="'+item.sname+'" class="sname longlonginfo"><input readonly value="'+item.behavior+'" name="'+item.behavior+'" class="shortinfo behavior"><span class="wd-del-btn">删除</span><div><span class="wd-close-btn">取消</span> <span class="wd-submit-btn">确认</span></div></li>')
                                
                            })
                            if(item.lines && item.lines.length>0){
                                $(".wangdian-add,.wangdian-edit").css('display','block')
                            }
                              item.goods.forEach(function(item,index){
                                var  BeginTime =  ""
                                var  EndTime = ""
                                if(item.BeginTime){
                                  BeginTime = parseInt((item.BeginTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + ":" + parseInt((item.BeginTime % (1000 * 60 * 60)) / (1000 * 60));
                                }
                                if(item.EndTime){
                                  EndTime = parseInt((item.EndTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + ":" + parseInt((item.EndTime % (1000 * 60 * 60)) / (1000 * 60));
                                }
                                sbHtml.push('<li data-id='+datasetId+'>'+(index+1)+'<span class="longinfo">'+item.name+'</span><span class="shortinfo">'+item.model+'</span><span class="shortinfo">'+BeginTime+'</span><span class="shortinfo">'+EndTime+'</span></li>')
                              })
                              item.staffs.forEach(function(item,index){  
                                var  BeginTime =  ""
                                var  EndTime = ""
                                if(item.BeginTime){
                                  BeginTime = parseInt((item.BeginTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + ":" + parseInt((item.BeginTime % (1000 * 60 * 60)) / (1000 * 60));
                                }
                                if(item.EndTime){
                                  EndTime = parseInt((item.EndTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + ":" + parseInt((item.EndTime % (1000 * 60 * 60)) / (1000 * 60));
                                }
                                ryHtml.push('<li data-id='+datasetId+'>'+(index+1)+'<span class="longinfo">'+item.idcard.name+'</span><span class="shortinfo">'+item.position+'</span><span class="shortinfo">'+BeginTime +'</span><span class="shortinfo">'+EndTime +'</span></li>')
                              })

                              $("#carTaskWD").html(wdHtml.join(''))
                              $("#carTaskSB").html(sbHtml.join(''))
                              $("#carTaskRY").html(ryHtml.join(''))  
                              $("#checkerUL").html(checkHtml.join(''))
                              //加载网点
                              var struct_data = { 
                                filter: {type: '网点',struct_id:struct_id,StateType:'有效'},  
                              }
                              $.when(request.Post("common/find/struct",struct_data)) 
                                .done(function (data) { 
                                    var new_data = []
                                    for(var i in data){
                                        var row = data[i]
                                        if(row.fid == row.id){
                                            new_data.push('<option value='+JSON.stringify(row)+'>'+row.sname+'</option>') 
                                        }
                                    }
                                    console.log(new_data)
                                    $("#wd-add-list").html(new_data.join(''))
                                })

                            })

                            if(typeof(J_carTaskItem_index)!="undefined"){ 
                                $('.J_carTaskItem').eq(J_carTaskItem_index).click()
                            }
                            

                            //绘制轨迹
                            // DATA.currentTask.getTracks();
                            // BDMap.draw();
                        }
                    })
                    .fail(function (xhr) {
                        console.log(JSON.stringify(xhr));
                    });
            },
            loadVedioList: function () {
               // DOM.other.notification.clear(); 
                if (BDMap_map) {
                    var serviceURL = "gps/";
                    if (DATA.escortVehicles.selected.length > 0) {      //加载指定车辆
                        serviceURL += "getLocations/";
                        for (var i = 0; i < DATA.escortVehicles.selected.length; i++) {

                            if (DATA.escortVehicles.selected[i].classify) {
                                serviceURL += DATA.escortVehicles.selected[i].classify.imei + ",";
                            } else {
                                serviceURL += DATA.escortVehicles.selected[i].imei + ",";
                            }
                        }
                        serviceURL = serviceURL.substr(0, serviceURL.length - 1); 
                    } else {                                            //加载所有车辆
                        serviceURL += "getAllLocations";
                        //console.log(999) 
                        
                    }
                    $.when(request.Get(serviceURL))
                        .done(function (data) {
                            var _result = data.result;
                            if (_result.length === 0) {
                                DATA.escortVehicles.all = [];
                                return;
                            }

                            // if(!_.isEmpty(DATA.escortVehicles.all)){
                            //     //console.log('old')
                            //   DATA.escortVehicles.oldAllPosition =JSON.parse(JSON.stringify({'data':DATA.escortVehicles.all})).data
                            //   //console.table(DATA.escortVehicles.oldAllPosition)   
                            // }
                            if(_.isEmpty(DATA.escortVehicles.preAll)){
                                DATA.escortVehicles.preAll = _.take(DATA.escortVehicles.all, DATA.escortVehicles.all.length);
                            }else{
                                _.forEach(DATA.escortVehicles.preAll, function(pre_item){
                                    _.forEach(DATA.escortVehicles.all, function(item){
                                        if(pre_item._id === item._id){
                                            _.assign(pre_item, item);
                                        }
                                    });
                                });
                            }

                            DATA.escortVehicles.all = DATA.parseCoords(_result);

                            //遍历报警数据，将报警车辆状态设置  为alarm: true
                            _.forEach(DATA.alarmMQ.data, function(alarmData){
                                _.forEach(DATA.escortVehicles.all, function(escortVehicleData){
                                    if(_.eq(alarmData.content.imei, escortVehicleData.imei) && alarmData.status !== 2){
                                        escortVehicleData.alarm = true;
                                    }
                                });
                            });
                            BDMap.getVedioList();
                            DOM.rightMenu.escortVehicles.update();
                        })
                        .fail(function (xhr) {
                            console.log(JSON.stringify(xhr));
                        });
                }
            }
        },
        staffs: {   //员工相关
            all: [],
            load: function (event, treeId, treeNode) {//加载押运车辆
                DOM.other.notification.clear();
                treeClickNodeId = treeNode._id
                var request_get_staff_params = {
                    filter: {struct_id: treeNode._id}
                };
                $.when(request.Post("common/find/staff", request_get_staff_params))
                    .done(function (data) {
                        DATA.dunanInfo.perNum = data.length
                        $(".data_per_num").html(DATA.dunanInfo.perNum+' 人')
                        $('#staffUl').empty()
                        var _result = data;
                        console.log(data)  
                        var htmlStr = []
                        _result.forEach(function(item){
                           htmlStr.push('<li>'+item.name+'</li>')
                        })
                        $('#staffUl').append(htmlStr.join(''))
                        if (_result.length === 0) {
                            DATA.staffs.all = [];
                            return;
                        }
                        DATA.staffs.all = _result;
                        DOM.rightMenu.staffs.update();
                    })
                    .fail(function (xhr) {
                        console.log(JSON.stringify(xhr));
                    });
            }
        },
        overspeedLog: {
            all: [],
            load: function () {
                var _data = {
                    filter: {date: new Date().format("yyyy-MM-dd"), speed: {$exists: true}}//new Date().format("yyyy-MM-dd")
                };
                $.when(request.Post("common/find/log_overspeed", _data)) 
                    .done(function (data) {
                        if (data && data.length > 0) {
                            DATA.overspeedLog.all = data;
                            DOM.rightMenu.overspeedLog.update();
                            DOM.rightMenu.overspeedLog.size.update();
                        }
                    })
                    .fail(function (xhr) {
                        // console.log(JSON.stringify(xhr));
                    });
            },
            add: function (o) {
                var log = {
                    speed: o.speed,
                    speedlimit: shendun.global.SPEED_LIMIT,
                    imei: o.imei,
                    lpn: o.deviceName,
                    date: new Date().format("yyyy-MM-dd"),
                    date_time: o.gpsTime,
                };

                $.when(request.Post("common/insertOne/log_overspeed", log))
                    .done(function (data) {
                        if (data && data[0] && data[0].result) {
                            DATA.overspeedLog.all.push(log);
                            DOM.rightMenu.overspeedLog.append(log);
                            DOM.rightMenu.overspeedLog.size.update();
                        }
                    })
                    .fail(function (xhr) {
                        // console.log(JSON.stringify(xhr));
                    });
            },
            //测速
            speedlimit: {
                value: null,
                load: function () {
                    var _data = {
                        filter: {},
                        sort: {_id: 1},
                        page: 1,
                        pageSize: 1
                    };
                    $.when(request.Post("common/find/log_overspeed", _data))
                        .done(function (data) {
                            if (data && data.length == 1) {
                                DATA.overspeedLog.speedlimit.value = data[0].speedlimit;
                                shendun.global.SPEED_LIMIT = data[0].speedlimit;
                                DOM.rightMenu.overspeedLog.speedlimit.update();
                            }
                        })
                        .fail(function (xhr) {
                            // console.log(JSON.stringify(xhr));
                        });
                }
            }
        },
        currentTask: {
            data: [],
            imei: "",
            taskArr:[], // 当前车辆的任务列表
            lines: [],
            linesPoints: [],
            staffs: [],
            goods: [],
            getTracks: function(){
                DATA.currentTask.lines = _.compact(_.map(DATA.currentTask.lines, function(item){    //过滤没有坐标的数据
                    if(item.coordinates[0] && item.coordinates[1]){
                        return {"lng": item.coordinates[0], "lat": item.coordinates[1], "name": item.name, "address": item.address, "updateDateTime": item.UpdateDateTime};
                    }
                }));
                var linesLocations = DATA.parseCoords(DATA.currentTask.lines);
                for(var i=0;i<linesLocations.length;i++){
                    DATA.currentTask.linesPoints.push(new BMap.Point(linesLocations[i].lng, linesLocations[i].lat));
                }

                //绘制任务路线
                // BDMap.drawLines();

                //绘制任务详情数据,任务人员数据,任务资产数据
                var staffsDomTmp = '<tr>'+
                    '<td>@name@</td>'+
                    '<td>@position@</td>'+
                    '<td>@gender@</td>'+
                    '<td>@contact@</td>'+
                    '</tr>',
                    goodsDomTmp = '<tr>'+
                        '<td>@name@</td>'+
                        '<td>@model@</td>'+
                        '<td>@type@</td>'+
                        '<td>@count@</td>'+
                        '<td>@code@</td>'+
                        '<td>@beginTime@</td>'+
                        '</tr>',
                    staffsDomResult = [],
                    goodsDomResult = [];

                _.forEach(DATA.currentTask.staffs, function(item){
                    var _itemDom = staffsDomTmp.replace("@name@", item.idcard.name)
                        .replace("@position@", item.position)
                        .replace("@gender@", item.idcard.sex)
                        .replace("@contact@", item.contacts[0].contacts);
                    staffsDomResult.push(_itemDom);
                });

                _.forEach(DATA.currentTask.goods, function(item){
                    var time = new Date(item.BeginTime).format("yyyy-MM-dd HH:mm:ss");

                    var _itemDom = goodsDomTmp.replace("@name@", item.name)
                        .replace("@model@", item.model)
                        .replace("@type@", item.type)
                        .replace("@count@", item.count)
                        .replace("@code@", item.code)
                        .replace("@beginTime@", time);

                    goodsDomResult.push(_itemDom);
                });

                $("#"+DOM.infoPanel.id).find("#tab-staffs tbody").empty().html(staffsDomResult.join(""));
                $("#"+DOM.infoPanel.id).find("#tab-goods tbody").empty().html(goodsDomResult.join(""));
            },
            reset: function(){
                DATA.currentTask.lines = [];
                DATA.currentTask.linesPoints = [];
                DATA.currentTask.staffs = [];
                DATA.currentTask.goods = [];
            }
        },
        leftMenu: {
            yayun: {//押运部组织树
                all: [],
                load: function () {
                    // 获取押运部id
                    var request_yayun_params = {
                        filter: {name: "押运部", type: "企业架构", StateType:"有效"}
                    };
                    $.when(request.Post("common/find/struct", request_yayun_params))
                        .done(function (yayun_root_data) {
                            if (!yayun_root_data) {
                                return;
                            }
                            // 基于押运部id获取押运部组织架构
                            var request_struct_prams = {
                                filter: {type: "企业架构", StateType:"有效"},
                                sort: {"no": 1},
                            };
                            $.when(request.Post("common/find/struct", request_struct_prams))
                                .done(function (data) {
                                    if (data && data.length > 0) {
                                        // todo 移除不属于押运部的数据
                                        _.remove(data, function(item){
                                            return _.isEmpty(item.struct_id) || item.path.indexOf(yayun_root_data[0]._id) === -1;
                                        });

                                        yayun_root_data[0].name = "全部";     //根节点 名称修改为 全部
                                        yayun_root_data[0].open = true;     //根节点 默认展开


                                      DATA.leftMenu.yayun.all = _.union(yayun_root_data, data);
                                      DOM.leftMenu.deptYayun.init();
                                    }
                                })
                                .fail(function (xhr) {
                                    // console.log(JSON.stringify(xhr));
                                });
                        })
                        .fail(function (xhr) {
                            // console.log(JSON.stringify(xhr));
                        });
                },
                getStructCars: function(event, treeId, treeNode){
                    struct_id = treeNode._id
                    // 获取各组车辆,显示在地图和rightmenu的押运车辆列表中
                    if(treeNode.level === 0 && treeNode.name === "全部"){
                        
                        DATA.escortVehicles.selected = [];  
                        DATA.escortVehicles.poll.restart();
                    }else{
                        var request_goods_car_params = {
                            filter: {type: "车辆", struct_id: treeNode._id}
                        };
                        $.when(request.Post("common/find/goods", request_goods_car_params))
                            .done(function (data) {
                                if (data && data.length > 0) {
                                    DATA.escortVehicles.selected = data;
                                    DATA.escortVehicles.carList = data; 
                                    DATA.escortVehicles.poll.restart();
                                    DATA.escortVehicles.loadVedioList();
                                    // videolistInterval = setInterval(function(){
                                    //     DATA.escortVehicles.loadVedioList()
                                    // }, 60000); 
                                    
                                }
                            })
                            .fail(function (xhr) {
                                // console.log(JSON.stringify(xhr));
                            });
                    }

                    // 加载中队车组的当前任务列表
                    if(treeNode.level === 2) {
                      var getCarTasksParams = {
                        filter: {"goods": {"$elemMatch": {"type": '车辆'}}, "Date": new Date().format("yyyy-MM-dd"),EmuName: treeNode.name}
                      };

                      $.when(request.Post("common/find/task", getCarTasksParams))
                        .done(function (data) {
                            if(data.length>0){
                              $("#carTask").html('')
                              data.forEach(function(item) {
                                $("#carTask").append('<li class="J_carTaskItem" data-id='+item._id+'>'+item.Caption+'   '+item.EmuName+'   '+item.TaskType+'</li>')
                              })
                              $("#carTaskWD").html('')
                              $("#carTaskSB").html('')
                              $("#carTaskRY").html('')
                              $("#checkerUL").html('')
                            }
                        })
                        .fail(function (xhr) {
                          // console.log(JSON.stringify(xhr));
                        });
                    }

                    DOM.rightMenu.open();
                    // 展开押运列表
                    DOM.rightMenu.escortVehicles.expand();
                }
            },
            branches: {//网点
                all: [],
                categorys: [],
                load: function(){
                    // 获取网点分类
                    $.when(request.Post("common/distinct/struct/class"))
                        .done(function (data_category) {
                            if (data_category && data_category.length > 0) {
                                DATA.leftMenu.branches.categorys = _.compact(data_category);

                                // 获取所有网点
                                var request_branche_params = {
                                    filter: {type: "网点","StateType": "有效"}
                                };
                                $.when(request.Post("common/find/struct", request_branche_params))
                                    .done(function (data) {
                                        DATA.dunanInfo.wdNum = data.length
                                        $(".data_wd_num").html(data.length+"个")
                                        if (data && data.length > 0) {
                                            DATA.leftMenu.branches.all = data;
                                            DOM.leftMenu.branches.init();
                                        }
                                    })
                                    .fail(function (xhr) {
                                        // console.log(JSON.stringify(xhr));
                                    });
                            }
                        })
                        .fail(function (xhr) {
                            // console.log(JSON.stringify(xhr));
                        });
                },
                getStructBranches: function(event, treeId, treeNode){
                    // 将子网点显示在地图中
                    if(!treeNode.children){
                        DATA.leftMenu.branches.all = [];
                        DATA.leftMenu.branches.all.push(treeNode);
                    }else{
                        DATA.leftMenu.branches.all = treeNode.children;
                    }
                    BDMap.drawBranches();
                },
                //修改网点数据,供ztree绘制使用
                formatBranchCategoryDataForTree:function (){
                    var categorys = DATA.leftMenu.branches.categorys,
                        allBranches = DATA.leftMenu.branches.all;
                    if(_.isEmpty(categorys) || _.isEmpty(allBranches)){
                        return;
                    }
                    var result = [];
                    for(var i=0; i<categorys.length; i++){
                        var childres = _.filter(allBranches, {class: categorys[i]});
                        result.push({name:categorys[i], children: childres});
                    }

                    return result;
                },
            },
        },
        alarmMQ: {
            data: [],
            load: function(){
                var get_alarms_params = {
                    filter: {datetime: {"$gte": dayjs().valueOf()}}
                };
                $.when(request.Post("common/find/alarm", get_alarms_params))
                    .done(function(res) {
                        if (res.length > 0){
                            res.forEach(function(x){
                              DATA.alarmMQ.data.push(x);
                            })

                            //更新rightMenu报警列表
                            DOM.rightMenu.alarm.received.update();
                            DOM.rightMenu.alarm.processing.update();
                            DOM.rightMenu.alarm.processed.update();
                        }else{
                            $(".data_alarmend_num").html('0个')
                            $(".data_alarming_num").html('0个')
                            $(".data_alarmun_num").html('0个')
                           // $(".data_alarmend_num").html('0个')

                        }
                    })
                    .fail(function(xhr){
                        console.log("get today alarm fail: " + JSON.stringify(xhr));
                    })
                    .always(function(){

                      // var alarmData = {
                      //   "content":"","datetime":1544540186036,"from":"5b4d4129bee64e3d8b39e5bd","groupID":"alarm_monitor","locationContent":{"lat":34.35267,"lgt":107.28113},"toGroup":true,"type":0
                      // }
                      // DATA.alarmMQ.data.push(alarmData);
                      // DOM.rightMenu.alarm.received.update();

                        // 报警监听
                        ws_alarm_monitor = new WebSocket(DATA.api.alarm_monitor);
                        ws_alarm_monitor.onopen = function (event) {
                          console.log("ws_alarm_monitor 与服务器建立连接");
                        };
                        ws_alarm_monitor.onerror = function (event) {
                            $alertModal.find(".am-modal-bd").text("消息通道连接失败!请检查网络链接!");
                            $alertModal.modal();
                        };
                        ws_alarm_monitor.onclose = function (event) {
                            DOM.other.notification.show("消息通道关闭!请检查网络或刷新重连!", DOM.other.notification.type.warning);
                        };

                        ws_alarm_monitor.onmessage = function (event) {
                          console.log(event,'报警信息')

                            var alarmData = JSON.parse(event.data);
                            var alarmRecord = _.filter(DATA.alarmMQ.data, function(item){
                              return (!item.status || item.status === 1) && item.content.deviceName === alarmData.content.deviceName && (alarmData.datetime - item.datetime) < 60*1000;
                            });
                            if(_.isEmpty(alarmRecord)){
                              DATA.alarmMQ.data.push(alarmData);
                            }

                            // DOM.rightMenu.alarm.received.update();
                            // if(alarmData._id){
                            //   // 更新库
                            //   DATA.alarmMQ.updateRecords({_id: alarmData._id, status:0, records:[]});
                            //   //更新rightMenu报警列表
                            //   DOM.rightMenu.alarm.received.update();
                            // }else{
                            //   // 将报警状态及操作记录写入库
                            //   alarmData.status = 0;
                            //   alarmData.records = [];
                            //   DATA.alarmMQ.addAlarmRecords(alarmData);
                            // }
                            
                            var _alarmjsoncont = JSON.parse(alarmData.content)
                            //console.log(_alarmjsoncont)
                            $(".alarm-device").text(_alarmjsoncont.deviceName) 
                            $(".alarm-name").text(_alarmjsoncont.alarmName)
                            $(".alarm-date").text(_alarmjsoncont.alarmTime)
                            $(".alarm-jingwei").text(_alarmjsoncont.lat+','+_alarmjsoncont.lng)
                            $(".alarm-address").text(_alarmjsoncont.address)
                            $(".alarm-modal-btn").css('display','none')
                            $(".alarm-modal").fadeIn()//报警弹窗 

                          if(alarmData.type === 0){    //PDA报警消息
                            $(".alarm-type").text('PDA报警')
                                DATA.alarmMQ.alarm_pda.load(alarmData);
                            }else if(alarmData.type === 3){     //车载GPS报警消息
                                $(".alarm-type").text('GPS报警')
                                var _content = JSON.parse(alarmData.content);
                                // 将所有类型的GPS报警写入indexDB
                                var storeGPSAlarm = new shendun.util.storeGPSAlarm();
                                storeGPSAlarm.method.add(_content);

                                if(Number(_content.alarmType) === 1){    
                                    $(".alarm-type").text('SOS报警')  // SOS报警，接口文档http://www.jimicloud.com/apiJimi.html#消息推送接口
                                    $(".alarm-modal-btn").css('display','block').attr('data-id',alarmData.datatime) 
                                    alarmData.content = _content;

                                    // 播放报警提示声音
                                    DOM.rightMenu.alarm.audio.play(DOM.rightMenu.alarm.audio.resource.car);

                                    //保存报警信息
                                    if(DATA.alarmMQ.data.length === 0){
                                        DATA.alarmMQ.data.push(alarmData);
                                    }else { //去掉1min内的重复报警
                                        var alarmRecord = _.filter(DATA.alarmMQ.data, function(item){
                                            return (!item.status || item.status === 1) && item.content.deviceName === alarmData.content.deviceName && (alarmData.datetime - item.datetime) < 60*1000;
                                        });

                                        if(_.isEmpty(alarmRecord)){
                                            DATA.alarmMQ.data.push(alarmData);
                                        }
                                    }
                                    DOM.rightMenu.alarm.received.update();

                                    if(alarmData._id){
                                        // 更新库
                                        DATA.alarmMQ.updateRecords({_id: alarmData._id, status:0, records:[]});
                                        //更新rightMenu报警列表
                                        DOM.rightMenu.alarm.received.update();
                                    }else{
                                        // 将报警状态及操作记录写入库
                                        alarmData.status = 0;
                                        alarmData.records = [];
                                        DATA.alarmMQ.addAlarmRecords(alarmData);
                                    }
                                }
                            }
                        };
                    });
            },
            alarm_pda: {
                load: function(data){
                    if(data.from) {
                        // 根据from属性在staff表查询员工信息
                        var request_staff_info_params = {
                            // from字段貌似不是userId，是消息id，不能作为判断条件
                            filter: {_id: data.from}
                        };
                        $.when(request.Post("common/find/staff", request_staff_info_params))
                            .done(function (staff_info) {
                                if (!staff_info) {
                                    return;
                                }
                                data.status = 0;    // 0:报警, 1:已接警，2:已结案
                                data.userInfo = staff_info[0];

                                // 在地图上显示报警人
                                var flagResult = DOM.rightMenu.alarm.flag(data);
                                data.marker = flagResult.marker;
                                data.infoWindow = flagResult.infoWindow;

                                //保存报警信息
                                if(DATA.alarmMQ.data.length === 0){
                                    DATA.alarmMQ.data.push(data);
                                }else { //去掉1min内的重复报警
                                    var alarmRecord = _.filter(DATA.alarmMQ.data, function(item){
                                        return (!item.status || item.status === 1) && item.from === data.from && (data.datetime - item.datetime) < 60*1000;
                                    });

                                    if(_.isEmpty(alarmRecord)){
                                        DATA.alarmMQ.data.push(data);
                                    }
                                }

                                if(data._id) {
                                    // 将报警状态及操作记录写入库
                                    DATA.alarmMQ.updateRecords({_id: data._id, status: 0, records: []});

                                    //更新rightMenu报警列表
                                    DOM.rightMenu.alarm.received.update();
                                }else{
                                    // 将报警状态及操作记录写入库
                                    data.status = 0;
                                    data.records = [];
                                    DATA.alarmMQ.addAlarmRecords(data);
                                }

                                // 播放报警提示声音
                                DOM.rightMenu.alarm.audio.play(DOM.rightMenu.alarm.audio.resource.pda);
                            })
                            .fail(function (xhr) {
                                // console.log(JSON.stringify(xhr));
                            });
                    }
                }
            },
            addAlarmRecords: function(_alarmData){
                $.when(request.Post("common/insertOne/alarm", _alarmData))
                    .then(function(res){
                        var _alarm_params = {
                            filter: {
                                from: _alarmData.from,
                                datetime: _alarmData.datetime,
                                type: _alarmData.type,
                                status: _alarmData.status
                            }
                        };
                        $.when(request.Post("common/find/alarm", _alarm_params))
                            .done(function(_alarms){
                                var _alarm = _alarms[0];
                                _.filter(DATA.alarmMQ.data, function(item){
                                    if(item.from === _alarm.from && item.datetime === _alarm.datetime && item.type === _alarm.type && item.status === _alarm.status){
                                        item._id = _alarm._id;
                                    }
                                });
                                //更新rightMenu报警列表
                                DOM.rightMenu.alarm.received.update();
                            });
                    });
            },
            updateRecords: function(params){    // 将报警状态及操作记录写入库
                /*params:
                * _id: [string] alarm id,
                * status: [int] 0:报警, 1:已接警，2:已结案
                * records: [array] json, 报警处理过程的向西记录*/
                if(!params._id){
                    console.log("update alarm records fail: _id undefined.");
                    return;
                }

                var updateParams = {
                    /*"status": params.status,
                    "records": params.records*/
                };
                if(params.status !== "undefined"){
                    updateParams.status = params.status;
                }
                if(params.records !== "undefined"){
                    updateParams.records = params.records;
                }

                var update_alarm_params = {
                    filter: {_id: params._id},
                    update: {
                        "$set":updateParams
                    }
                };
                request.Post("common/updateOne/alarm", update_alarm_params);
            },
            getAlarmRecords: function(_id){     // 报警记录与报警事件为主，不是以报警人员为主
                var alarm_records_params = {
                    filter: {_id: _id}
                };
                $.when(request.Post("common/find/alarm", alarm_records_params))
                    .done(function (data) {

                    })
                    .fail(function (xhr) {
                        // console.log(JSON.stringify(xhr));
                    });
            }
        },
        chat:{
            data: [],
            other: null,    // 报警人信息
            ws_chat: null,
            load: function(params){     // 获取历史聊天记录
                var request_getChat_params = {
                    filter: {_id: params.from}
                };
                $.when(request.Post("common/find/alarm", request_getChat_params))
                    .done(function (res) {
                        DATA.chat.data = res.result;

                        DATA.chat.listen();

                        DOM.chat.open(params);
                    })
                    .fail(function (xhr) {
                        // console.log(JSON.stringify(xhr));
                    });
            },
            listen: function(){      // 发起聊天
                DATA.chat.ws_chat = new WebSocket(DATA.api.chat_monitor);
                DATA.chat.ws_chat.onopen = function (event) {
                    console.log("ws_alarm_monitor 与服务器建立连接");
                };
                DATA.chat.ws_chat.onerror = function (event) {
                    console.log(event.data);
                };
                DATA.chat.ws_chat.onclose = function (event) {
                    console.log(event);
                };

                DATA.chat.ws_chat.onmessage = function (event) {
                    if(event && event.data){
                        $("#"+DOM.chat.contentId).val("");
                        var result = JSON.parse(event.data).result[0];
                        DATA.chat.data.push(result);
                        DOM.chat.update(result);
                    }
                }
            }
        },
        // 获取地理街道
        getAddressStreet: function(goePoint){
            var defer = $.Deferred(),
                geoc = new BMap.Geocoder();
            geoc.getLocation(goePoint, function (rs) {
                var addComp = rs.addressComponents;
                var result = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                defer.resolve(result);
            });
            return defer.promise();
        },
        // 获取指定车辆的摄像头视频
        getCarVideo: function(data){
            var defer = $.Deferred();

            var _isAvailable = DOM.videoControl.isServiceAvaliable();
            if (!_isAvailable){
                return defer.reject({isAvailable: false});
            }
            //TODO
            // 原数据data._id 或 data.imei并非device表type:gps的imei
            //无奈，只能用车牌号查询车辆id，再去device表查询type:video的数据
            //数据不是一般混乱哇
            
            var carNameArr = data.deviceName.split("-"),
                carName = carNameArr[carNameArr.length-1];
                //console.log(carNameArr)
                var first_code = carName.substring(0,1);
                if(!isNaN(first_code)){
                    carName = carName.substr(1)
                }
            var getCarIdPrams = {
                filter: {name: carName, type: "车辆"},
                projection: {_id: 1, name:1} 
            };
            var _data = {
                filter: {install_id: data.car_id, type: 'video'}
            };
            $.when(request.Post("common/find/device", _data))
                .done(function (data) {
                    var __data = data[0];
                    if(__data && __data.video){
                        return defer.resolve(__data.video);
                    }else{
                        return defer.reject([]);
                    }
                    // var __data = data[0];
                    // if(__data && __data.video){
                    //     return defer.resolve(__data.video);
                    // }else{
                    //     return defer.reject([]);
                    // }
                })
                .fail(function (xhr) {
                    defer.reject(xhr);
                    console.log("未查询到当前车辆搭载的摄像头信息. "+JSON.stringify(xhr));
                });
                return defer.promise();
            // $.when(request.Post("common/find/goods", getCarIdPrams))
            //     .done(function (data) {
            //         if(!data || data.length === 0){
            //             return defer.reject([]);
            //         }
            //         var currCarId = data[0]._id;  

            //         var _data = {
            //             filter: {install_id: data.car_id, type: 'video'}
            //         };
            //         $.when(request.Post("common/find/device", _data))
            //             .done(function (data) {
            //                 var __data = data[0];
            //                 if(__data && __data.video){
            //                     return defer.resolve(__data.video);
            //                 }else{
            //                     return defer.reject([]);
            //                 }
            //             })
            //             .fail(function (xhr) {
            //                 defer.reject(xhr);
            //                 console.log("未查询到当前车辆搭载的摄像头信息. "+JSON.stringify(xhr));
            //             });
            //     })
            //     .fail(function (xhr) {
            //         console.log("未查询到当前车辆id. "+JSON.stringify(xhr));
            //     });
            // return defer.promise();
        }
    };

    DOM = {
        init: function () {
            this.footer.tip.refresh.addChangeListener();
            this.footer.set.themeInit();
            $("#chuliinformation").hide();
            //10月30日添加
            this.footer.set.changeColor();
            this.footer.set.setColor();
            this.footer.set.setCheckbox();
            this.leftMenu.init();
            this.leftMenu.ctrl.addClickListener();

            this.rightMenu.addClickListener();
            this.rightMenu.ctrl.addClickListener();
            this.other.screen.addClickListener();
            this.other.notification.init();
            window.onresize = function () {
                DOM.leftMenu.resize();
                DOM.rightMenu.ctrl.relocate();
                DOM.other.notification.init();
            };
            // getJiFangAlarms();
            //DOM.roots.add();
            setInterval(DOM.footer.times.show, 1000);
            $(DOM.footer.tip.refresh.clazz).on("change", function () {
                $(DOM.footer.tip.refresh.clazz).find("option[value=" + $(DOM.footer.tip.refresh.clazz).val() + "]").attr("selected", "selected");
                $(DOM.footer.tip.refresh.clazz).find("option[value=" + $(DOM.footer.tip.refresh.clazz).val() + "]").siblings().removeAttr("selected");
                // $(DOM.footer.tip.refresh.clazz).find("option[value="+$(DOM.footer.tip.refresh.clazz).val()+"]").prev().attr("selected"," ");
                DATA.escortVehicles.poll.restart();
            });

            // 鼠标皮肤
            // $(".js-set-cursor input[name='cursor']").on("click", function () {
            //     $("html,body").css("cursor", "url(assets/images/cursor_" + $(this).val() + "_64X64.ico),auto;");
            // });

            $("#logout").on('click', function(e){
                event.stopPropagation()
                new shendun.util.logout();
            });

            //echarts 显示控制
            // $(".js-footer-item-charts").on('click', '.chart', function(){
            //     var echartType = $(this).attr("class").split(" ")[1];       //隐式规则，每个.chart 的第二个class将作为data-visualization页面要显示的chart标识
            //     var _width = 600,
            //         _height = 600,
            //         _top = (window.screen.availHeight - 30 - _height) / 2,
            //         _left = (window.screen.availWidth - 10 - _width) / 2;
            //
            //     if(echartType === "car-messages"){
            //         _width = window.screen.availWidth;
            //         _height = window.screen.availHeight;
            //         _top = 0;
            //         _left = 0;
            //     }
            //     var features = "top="+_top+",left="+_left+",width="+_width+",height="+_height+",menubar=0,scrollbars=0,resizable=0,status=0,titlebar=0,toolbar=0,location=0,alwaysRaised=1,depended=1,channelmode=0,directories=0";
            //     var _url = "data-visualization.html?class="+echartType;
            //     window.open(_url, "_blank", features);
            // });
        }
        ,header: {
            id: "header",
            setAccount: function(userInfo){
                $('.js-user-name').html(userInfo.uname);
            }
        },
        footer: {
            id: "footer",
            tip: {//提示信息：刷新时间
                refresh: {
                    clazz: "#footer .footer-item-tip select",
                    addChangeListener: function () {
                        var xianDate = new Date().getHours();
                        //console.log(xianDate);
                        if (xianDate >= 7 && xianDate < 20) {
                            $(DOM.footer.tip.refresh.clazz).find("option:eq(0)").attr("selected", "selected");
                        } else {
                            $(DOM.footer.tip.refresh.clazz).find("option:eq(0)").attr("selected", "selected");//2
                        }
                    }
                }
            },//改变颜色的
            set: {
                colors: ['#000', '#797E84', '#404040', '#002240', '#0C1021', '#7BB7FA', '#4486F0', '#3F5AB5', '#0F8FEC', '#0AC2D2', '#7BB7FA', '#FDC162', '#002240', '#F68DBB', '#0F8FEC', '#FD9922', '#8620FC'],
                changeColor: function () {
                    $('#set').click(function () {
                        $(".footer-item-checks").fadeToggle(200);
                    });
                },
                themeInit: function () {
                    var tmp = '<li style="background: @color@;"></li>';
                    var DOMResult = [];

                    for (var i = 0; i < DOM.footer.set.colors.length; i++) {
                        DOMResult.push(tmp.replace('@color@', DOM.footer.set.colors[i]));
                    }
                    $(".js-theme-change ul").html(DOMResult.join(''));
                },
                setColor: function (e) {
                    $(document).on('click', ".js-theme-change  ul li", function () {
                        var index = $(this).index();
                        $(this).addClass("current-theme").siblings().removeClass("current-theme");
                        $("#header,#right-menu,#right-menu-ctrl,.header-bottom,.footer,.slide-right-right-box,.footer-item-checks,.footer-item-set,.group,.slide-right-right-box-list ul li, .slide-right-right-box-list ul li ul li,.slide-right-right-box-list ul li ul li ul li").css({
                            'background-color': DOM.footer.set.colors[index],
                            opacity: 0.9
                        });
                        $(".footer-item-checks").fadeIn(200);
                    })
                },
                setCheckbox: function () {
                    /*  设置界面中： 复选框点击事件绑定*/
                    var selectInputs = document.getElementsByClassName('che'); // 所有勾选框
                    var checkAllInputs = document.getElementsByClassName('checkalltwo');// 全选框
                    for (var i = 0; i < selectInputs.length; i++) {
                        selectInputs[i].onclick = function () {
                            if (this.className.indexOf('checkall') >= 0) { //如果是全选，则吧所有的选择框选中
                                for (var j = 0; j < selectInputs.length; j++) {
                                    selectInputs[j].checked = this.checked;
                                }
                            }
                            if (!this.checked) { //只要有一个未勾选，则取消全选框的选中状态
                                for (var i = 0; i < checkAllInputs.length; i++) {
                                    checkAllInputs[i].checked = false;
                                }
                            }
                        }
                    }
                    var selectInputs1 = document.getElementsByClassName('chec'); // 所有勾选框
                    var checkAllInputs1 = document.getElementsByClassName('checkallone');// 全选框
                    for (var m = 0; m < selectInputs1.length; m++) {
                        selectInputs1[m].onclick = function () {
                            if (this.className.indexOf('checkall') >= 0) { //如果是全选，则吧所有的选择框选中
                                for (var n = 0; n < selectInputs1.length; n++) {
                                    selectInputs1[n].checked = this.checked;
                                }
                            }
                            if (!this.checked) { //只要有一个未勾选，则取消全选框的选中状态
                                for (var o = 0; o < checkAllInputs1.length; o++) {
                                    checkAllInputs1[o].checked = false;
                                }
                            }
                        }
                    }
                }

            },
            times: {//时间显示容器
                id: "times",
                days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
                show: function () {
                    $("#" + DOM.footer.times.id).html(new Date().format("yyyy年MM月dd日 HH:mm:ss") + " " + DOM.footer.times.days[new Date().getDay()]);
                }
            }
        },
        leftMenu: {//左侧菜单
            id: "left-menu",
            init: function () {

            },
            // FIXME 需要将押运部门树放到第三屏
            deptYayun: {//押运部部门树容器
                id: "deptYayun",
                yayunzTreeObj: '',
                init: function () {
                    var setting = {
                        data:{
                            key:{
                                name:"name"
                            },
                            simpleData:{
                                enable: true,
                                idKey: "_id",
                                pIdKey: "struct_id"
                            }
                        },
                        view:{
                            addDiyDom: DOM.leftMenu.deptYayun.addExtraInfo
                        },
                        callback: {
                            onClick: DOM.leftMenu.deptYayun.treeNodeClick
                        }
                    };
                    DOM.leftMenu.deptYayun.yayunzTreeObj = $.fn.zTree.init($("#yayun-tree"), setting, DATA.leftMenu.yayun.all);
                },
                // FIXME 点击押运部的事件  需要将视频数据 车组数据架加载在第三屏
                treeNodeClick: function(event, treeId, treeNode){
                    if(typeof(videolistInterval)!='undefined'){
                        clearInterval(videolistInterval) 
                    }
                    
                    DATA.leftMenu.yayun.getStructCars(event, treeId, treeNode);
                    DATA.staffs.load(event, treeId, treeNode);
                },
                addExtraInfo: function(treeId, treeNode){
                    //向ztree每个父节点node name后边添加子节点个数
                    DOM.other.addTotalChildsNum(treeNode);
                }
            },
            // FIXME 需要将网点树 渲染到第三屏
            branches: {// 网点树
                id: "branches",
                brancheszTreeObj: '',
                init: function () {
                    var setting = {
                        data: {
                            key: {
                                name: "name"
                            }
                        },
                        view:{
                            addDiyDom: DOM.leftMenu.branches.addExtraInfo
                        },
                        callback: {
                            onClick: DATA.leftMenu.branches.getStructBranches
                        }
                    };
                    var treeNodes = DATA.leftMenu.branches.formatBranchCategoryDataForTree();
                    DOM.leftMenu.branches.brancheszTreeObj = $.fn.zTree.init($("#branches-tree"), setting, treeNodes);
                },
                addExtraInfo: function(treeId, treeNode){
                    //向ztree每个父节点node name后边添加子节点个数
                    DOM.other.addTotalChildsNum(treeNode);
                }
            },
            ctrl: {//汉堡图标/左侧侧菜单控制按钮
                id: "left-menu-ctrl",
                addClickListener: function () {
                    $("#" + DOM.leftMenu.ctrl.id).on("click", function () {
                        DOM.leftMenu.resize();
                        $("#" + DOM.leftMenu.id).slideToggle(100);
                    });
                }
            },
            resize: function () {
                if ($("#" + DOM.leftMenu.ctrl.id).attr("display") != "none") {
                    DOM.leftMenu.init();
                }
            }
        },
        rightMenu: {//右侧菜单
            id: "right-menu",
            ctrl: {
                id: "right-menu-ctrl",
                addClickListener: function () {//右侧中间箭头图标点击事件
                    // var $rightMenuCtrl = $("#" + DOM.rightMenu.ctrl.id);
                    // var $rightMenu = $("#" + DOM.rightMenu.id);
                    // $("#" + DOM.rightMenu.ctrl.id).on("click", function () {
                    //     if ($rightMenuCtrl.find("i").hasClass("fa-angle-double-left")) {
                    //         DOM.rightMenu.open();
                    //     } else {
                    //         DOM.rightMenu.close();
                    //     }
                    // });
                },
                relocate: function () {
                    // var $rightMenuCtrl = $("#" + DOM.rightMenu.ctrl.id);
                    // if ($rightMenuCtrl.find("i").hasClass("fa-angle-double-right")) {
                    //     $rightMenuCtrl.css("right", document.getElementById(DOM.rightMenu.id).offsetWidth);
                    // }
                }
            },
            isOpened: function () {
                return $("#" + DOM.rightMenu.ctrl.id).find("i").hasClass("fa-angle-double-right");
            },
            open: function () {
                var $rightMenuCtrl = $("#" + DOM.rightMenu.ctrl.id);
                var $rightMenu = $("#viewThree");
                if ($rightMenuCtrl.find("i").hasClass("fa-angle-double-left")) {
                    $rightMenu.show().animate({"right": 0}, 100);
                    $rightMenuCtrl.animate({"right": document.getElementById(DOM.rightMenu.id).offsetWidth}, 100).find("i").removeClass("fa-angle-double-left").addClass("fa-angle-double-right");
                }

                // fixme 监听在线车辆点击事件, 并在地图上标明该车辆
                $rightMenu.on('click', "#"+DOM.rightMenu.escortVehicles.id+ " li", function(){
                    var coordinate = $(this).attr("data-coordinate").split(",");
                    BDMap.focus(coordinate[0],coordinate[1]);
                });
            },
            close: function () {
                var $rightMenuCtrl = $("#" + DOM.rightMenu.ctrl.id);
                var $rightMenu = $("#" + DOM.rightMenu.id);

                if ($rightMenuCtrl.find("i").hasClass("fa-angle-double-right")) {
                    $rightMenu.hide().animate({"right": "-50%"}, 100);
                    $rightMenuCtrl.animate({"right": 0}, 100).find("i").removeClass("fa-angle-double-right").addClass("fa-angle-double-left");
                }
            },
            addClickListener: function () {
                $("#" + DOM.rightMenu.id + " .am-panel>a").on("click", function () {//右侧菜单中，二级菜单的点击事件，控制箭头图标的切换)
                    var $icon = $(this).children(".am-margin-right");
                    if ($(this).siblings("ul").hasClass("am-in")) {
                        $icon.removeClass("am-icon-angle-down");
                        $icon.addClass("am-icon-angle-right");
                    } else {
                        $icon.removeClass("am-icon-angle-right");
                        $icon.addClass("am-icon-angle-down");
                    }
                });

                $("#" + DOM.rightMenu.escortVehicles.id + "  .am-tabs-nav li>a").on("click", function (e) {
                    var $this = $(this);
                    if ($this.parent("li").index() === 0 || $this.parent("li").index() === 2 || $this.parent("li").index() === 4) {//历史轨迹==3
                        if ($this.parent("li").index() === 0) {
                            var lngLat = $this.attr("id").split(",");
                            BDMap.focus(lngLat[0], lngLat[1]);
                        }
                        e.preventDefault();
                        $this.parent("li").addClass("am-active").siblings("li").removeClass("am-active");
                        $this.parents(".am-tabs").find(".am-tab-panel").each(function () {
                            $(this).removeClass("am-active");
                        });
                        $($this.attr("href")).addClass("am-active");
                    }
                    if ($this.parent("li").index() === 1) {//任务==1
                        DATA.escortVehicles.loadTaskInfo($this.attr("id").substr(5));
                    }
                });

                // 点击接警按钮,将报警数据状态修改为1,即已接警;
                $("#"+DOM.rightMenu.id).on('click', "."+DOM.rightMenu.alarm.received.operation.receiveBtnClass, function(){
                    var id = $(this).parent().attr("data-id"),
                        toUId = "",
                        toUName = "";

                    _.forEach(DATA.alarmMQ.data, function(item, index){
                        if(item._id === id){
                            if (_.eq(item.type, 0)) {
                                toUId = item.userInfo._id;
                                toUName = item.userInfo.idcard.name;
                            } else if (_.eq(item.type, 3)) {
                                toUId = item.content.imei;
                                toUName = item.content.deviceName;
                            }
                        }
                    });

                    // 将报警状态及操作记录写入库
                    DATA.alarmMQ.updateRecords({
                        _id: id,
                        status:1,
                        records:[{
                            // _id: ,
                            uid: DATA.userInfo.uid,
                            uname: DATA.userInfo.uname,
                            toUid: toUId,
                            toUname: toUName,
                            content: "接警",
                            time: dayjs().valueOf(),
                            type: "operations"      // chat || operations
                        }]});

                    // 修改数据属性status, 其默认为0,表示报警消息, 1表示已接警, 2表示结案
                    _.forEach(DATA.alarmMQ.data, function(item, index) {
                        if (item._id === id) {
                            item.status = 1;

                            DOM.rightMenu.alarm.received.update();
                            DOM.rightMenu.alarm.processing.update();

                            return;
                        }
                    });
                });

                // 点击已接警tab下的记录, 地图中心切换到报警方
                // 判断报警类型, 如果是PDA报警, 打开报警人信息框和聊天窗口
                // 如果是车辆报警, 打开infowindow的video tab
                $("#pageFirst").on('click', "#"+DOM.rightMenu.alarm.processing.id+' li', function(){
                    var id = $(this).attr("data-id"),
                        alarmData = _.find(DATA.alarmMQ.data, {_id: id});
                    // console.log(alarmData)
                    // DOM.chat.open(alarmData);

                    if(_.eq(alarmData.type, 0)){
                        DOM.rightMenu.alarm.openInfoWindow(alarmData.marker, alarmData.infoWindow);
                        BDMap.focus(alarmData.locationContent.lgt, alarmData.locationContent.lat, false);
                        DATA.chat.load(alarmData);
                    }else if(_.eq(alarmData.type, 3)){
                        BDMap.focus(alarmData.content.lng, alarmData.content.lat, false);

                        _.forEach(BDMap.mapvLayers.data, function(item){
                            if(item.original.imei === alarmData.content.imei){
                                BDMap.showInfoWindow(item, 1);
                            }
                        });
                        $("."+DOM.infoPanel.controlDoms.infoPanelTabsNav).find("li:eq(1)").click();
                    }
                });

                // 点击结案按钮,将报警数据状态修改为2,即已结案;
                // 移除报警状态，非实时，下次数据刷新时生效
                $("#"+DOM.rightMenu.id).on('click', "."+DOM.rightMenu.alarm.processing.operation.processedBtnClass, function(){
                    var id = $(this).parent().attr("data-id"),
                        toUId = "",
                        toUName = "";

                    _.forEach(DATA.alarmMQ.data, function(item, index){
                        if(item._id === id){
                            if (_.eq(item.type, 0)) {
                                toUId = item.userInfo._id;
                                toUName = item.userInfo.idcard.name;
                            } else if (_.eq(item.type, 3)) {
                                toUId = item.content.imei;
                                toUName = item.content.deviceName;
                            }
                        }
                    });

                    // 将报警状态及操作记录写入库
                    DATA.alarmMQ.updateRecords({
                        _id: id,
                        status: 2,
                        records: [{
                            // _id: ,
                            uid: DATA.userInfo.uid,
                            uname: DATA.userInfo.uname,
                            toUid: toUId,
                            toUname: toUName,
                            content: "结案",
                            time: dayjs().valueOf(),
                            type: "operations"      // chat || operations
                        }]});

                    // 修改数据属性status, 其默认为0,表示报警消息, 1表示已接警, 2表示结案
                    _.forEach(DATA.alarmMQ.data, function(item, index) {
                        if (item._id === id) {
                            item.status = 2;

                            DOM.rightMenu.alarm.processing.update();
                            DOM.rightMenu.alarm.processed.update();

                            return;
                        }
                    });
                });

                // 监听聊天消息发送
                $(document).on('click', "#chat-submit", function(){
                    var chat_content = {
                            'uid': DATA.userInfo.uid,    //发送方id
                            'userName': DATA.userInfo.uname,   //发送
                            'toUId': DATA.chat.other.uid,      //接收方id
                            'toUName': DATA.chat.other.userName,
                            'content': $("#"+DOM.chat.contentId).val()
                        },
                        id = $(this).parent().attr("data-id");
                    DATA.chat.ws_chat.send(JSON.stringify(chat_content));

                    // 将沟通记录写入库
                    DATA.alarmMQ.updateRecords({
                        _id: id,
                        records: [{
                            // _id: ,
                            uid: DATA.userInfo.uid,
                            uname: DATA.userInfo.uname,
                            toUid: DATA.chat.other.uid,
                            toUname: DATA.chat.other.userName,
                            content: "结案",
                            time: dayjs().valueOf(),
                            type: "operations"      // chat || operations
                        }]
                    });
                });
            },
            alarm: {        // 报警模块
                id: "alarm-panel",
                count: {
                    id: "alarm-count"
                },
                icon:{
                    PDA: "fa-address-card",
                    GPS: "fa-truck"
                },
                audio:{
                    id: "alarm-audio",
                    resource: {
                        car: "assets/audios/alarm-car.mp3",
                        pda: "assets/audios/alarm-pda.mp3",
                        received: "assets/audios/alarm-received.mp3",
                    },
                    play: function(src){
                        $("#"+DOM.rightMenu.alarm.audio.id).attr("src", src).get(0).play();
                    }
                },
                flag: function(alarmData, showInfoWindow){  //在地图上标记报警人
                    var peoplePosition = new BMap.Point(alarmData.locationContent.lgt, alarmData.locationContent.lat);
                    var peopleIcon = new BMap.Icon("assets/images/alarm_person.png", new BMap.Size(40, 40));

                    var _marker = new BMap.Marker(peoplePosition, {icon: peopleIcon});  // 创建标注
                    _marker.setAnimation(BMAP_ANIMATION_BOUNCE);
                    _marker.disableMassClear();  //禁止覆盖物在 map.clearOverlays 方法中被清除
                    BDMap_map.addOverlay(_marker);

                    var staff_contact_tmp = '<span class="alarm-contact">@contact@</span>',
                        staff_contacts_dom = [];
 
                    var staff_contacts_result = "无",
                        reg_phone_num = /^[1][3,4,5,7,8][0-9]{9}$/;
                    _.forEach(alarmData.userInfo.contacts, function(item, index){
                        if(reg_phone_num.test(item.contact)){
                            staff_contacts_dom.push(staff_contact_tmp.replace("@contact@", item.contact));
                        }
                    });
                    if(_.isEmpty(staff_contacts_dom)){
                        staff_contacts_result = "无";
                    }else{
                        staff_contacts_result = staff_contacts_dom.join('');
                    }

                    var idcardNum = "无";
                    var reg_idcardNum = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                    if(reg_idcardNum.test(alarmData.userInfo.idcard.num)){
                        idcardNum = alarmData.userInfo.idcard.num;
                    }

                    var alarmTime = new Date(alarmData.datetime).format("yyyy-MM-dd HH:mm:ss");

                    var alarmTmp =
                        '<ul class="unstyle alarm-window js-alarm-window" style="margin:0;line-height:20px;padding:2px;">' +
                        '<li>姓名：' + alarmData.userInfo.idcard.name + '</li>' +
                        '<li>电话：' + staff_contacts_result + '</li>' +
                        '<li>身份证号：' + idcardNum + '</li>' +
                        '<li>经度：' + alarmData.locationContent.lgt + '</li>' +
                        '<li>纬度：' + alarmData.locationContent.lat + '</li>' +
                        '<li>时间：' + alarmTime + '</li>' +
                        '</ul>';

                    var _infoWindow = new BMapLib.SearchInfoWindow(BDMap_map, alarmTmp, {
                        title: "神盾报警消息",
                        width: 330,
                        height: 170,
                        panel: "panel",
                        enableAutoPan: true,
                        searchTypes: []
                    });

                    return {marker: _marker, infoWindow: _infoWindow};
                },
                openInfoWindow: function(marker, infoWindow){
                    infoWindow.open(marker);
                },
                closeInfoWindow: function(marker, infoWindow){
                    infoWindow.close(marker);
                },
                received: {     // 收到的报警
                    id: "alarm-reveived-list",
                    operation: {
                        receiveBtnClass: "js-alarm-receive-btn"
                    },
                    update: function(){
                        var tmp = '<li class="fz_0 dis_fx over_h" style="color:#FFD77E" data-from="@from@" data-id="@id@">'+
                                  ' <i class="dis_ib ver_m icon @icon@"></i>'+
                                  ' <span style="color:#FFD77E" class="code dis_ib ver_m font14 color_f ellipsis">@datetime@&nbsp;&nbsp;</span>'+
                                  ' <span style="color:#FFD77E" class="code dis_ib ver_m font14 color_f ellipsis">@type@&nbsp;&nbsp;</span>'+
                                  ' <span style="color:#FFD77E" class="code dis_ib ver_m font14 color_f ellipsis">@name@&nbsp;&nbsp;</span>'+
                                  ' <span style="color:#FFD77E" class="code dis_ib ver_m font14 color_f ellipsis">@alarmName@&nbsp;&nbsp;</span>'+
                                  ' <span class="dis_ib ver_m font14 flex1 ellipsis">@address@&nbsp;&nbsp;</span>'+
                                  ' <a href="javascript:;" class="btn dis_ib ver_m font14 J_reveive">接警</a>'+
                                  '</li>',
                            alarmData = DATA.alarmMQ.data,
                            resultDom = [];

                        if(!_.isEmpty(alarmData)) {
                            // 过滤报警数据
                            var receivedData = _.filter(alarmData, function(item, index){
                                return !item.status || item.status === 0 || item.content.alarmType!='1';//过滤必须为sos报警
                            });
                            $("#"+DOM.rightMenu.alarm.count.id).text(receivedData.length);
                            //console.log(receivedData)
                            if(receivedData.length === 0){
                                resultDom.push('<p class="no-data"><i class="fa fa-exclamation-circle"></i>当前无报警</p>');
                            }else {
                                for(var i = 0; i<receivedData.length;i++){
                                    var item = receivedData[i]
                                    var dateTime = new Date(item.datetime).format('yyyy-MM-dd HH:mm:ss'),
                                      userName = "",
                                      address = "",
                                      icon = "";     // 默认是PDA报警
 
                                    if (_.eq(item.type, 0)) {
                                      icon = DOM.rightMenu.alarm.icon.PDA;
                                      userName = item.userInfo ? item.userInfo.idcard.name : ''
                                      address = item.locationContent.lat +'   '+ item.locationContent.lgt
                                    } else if (_.eq(item.type, 3)) {
                                      icon = DOM.rightMenu.alarm.icon.GPS;
                                      userName = item.content.deviceName;
                                      address = item.address
                                    }
                                    resultDom.push(tmp.replace("@id@", item.datetime)
                                      .replace("@datetime@", dateTime)
                                      .replace("@address@", address)
                                      .replace("@alarmName@", item.content.alarmName || '')
                                      .replace("@icon@", icon)
                                      .replace("@type@",  item.type ===3 ? 'PDA报警' : 'GPS报警')
                                      .replace("@name@", userName)
                                      .replace('@from@',item.from)
                                    );
                                }
                            }
                            $("#"+ DOM.rightMenu.alarm.received.id).html(resultDom.join(''));


                            // 点击接警
                            $(".J_reveive").click(function (even) {
                              var id = $(even.currentTarget).parent().data('id')
                              var from = $(even.currentTarget).parent().data('from')
                              var chat_content = {
                                  'uid': DATA.userInfo.uid,    //发送方id
                                  'userName': DATA.userInfo.uname,   //发送
                                  'toUId': from,      //接收方id
                                  'toUName': '接收人',
                                  'content': '已接警'
                                };
                              ws_alarm_monitor.send(JSON.stringify(chat_content));

                              alarmData.filter(function (x) {
                                return x.datetime===id
                              })[0].status = 1
                              DOM.rightMenu.alarm.received.update();
                              DOM.rightMenu.alarm.processing.update();

                            })
                        }
                    }
                },
                processing: {       // 已接警，处理中
                    id: "alarm-processing-list",
                    operation: {
                        processedBtnClass: "js-alarm-processed-btn"
                    },
                    update: function(){
                      var tmp = '<li class="fz_0 dis_fx over_h" data-from="@from@" data-id="@id@">'+
                                ' <i class="dis_ib ver_m icon @icon@"></i>'+
                                ' <span class="tit dis_ib ver_m font14 color_f ellipsis">@datetime@</span>'+
                                ' <span style="color:red" class="code dis_ib ver_m font14 color_f ellipsis">@type@&nbsp;&nbsp;</span>'+
                                ' <span class="dis_ib ver_m font14 flex1 ellipsis">@name@</span>'+
                                ' <span style="color:red" class="code dis_ib ver_m font14 color_f ellipsis">@alarmName@&nbsp;&nbsp;</span>'+
                                ' <span class="dis_ib ver_m font14 flex1 ellipsis">@address@</span>'+
                                ' <i class="date dis_ib ver_m font14"></i>'+
                                ' <a href="javascript:;" class="btn dis_ib ver_m font14 J_jieAn">结案</a>'+
                                '</li>',
                            alarmData =  DATA.alarmMQ.data,
                            resultDom = [];

                        if(!_.isEmpty(alarmData)) {
                            // 过滤已接警的数据
                            var processingData = _.filter(alarmData, function(item, index){
                                return item.status === 1;
                            });

                            if(processingData.length === 0){
                                resultDom.push('<p class="no-data"><i class="fa fa-exclamation-circle"></i>无处理中的报警</p>');
                            }else {
                                _.forEach(processingData, function (item, index) {

                                  // var item = processingData[index]
                                  var dateTime = new Date(item.datetime).format('yyyy-MM-dd HH:mm:ss'),
                                    userName = "",
                                    address = "",
                                    icon = "";     // 默认是PDA报警

                                  if (_.eq(item.type, 0)) {
                                    icon = DOM.rightMenu.alarm.icon.PDA;
                                    userName = item.userInfo ? item.userInfo.idcard.name : ''
                                    address = item.locationContent.lat +'   '+ item.locationContent.lgt
                                  } else if (_.eq(item.type, 3)) {
                                    icon = DOM.rightMenu.alarm.icon.GPS;
                                    userName = item.content.deviceName;
                                    address = item.address
                                  }
                                  resultDom.push(tmp.replace("@id@", item.datetime)
                                    .replace("@datetime@", dateTime)
                                    .replace("@address@", address)
                                    .replace("@alarmName@", item.content.alarmName || '')
                                    .replace("@icon@", icon)
                                    .replace("@type@",  item.type ===3 ? 'PDA报警' : 'GPS报警')
                                    .replace("@name@", userName)
                                    .replace('@from@',item.from)
                                  );
                                });
                            }
                            $("#"+ DOM.rightMenu.alarm.processing.id).html(resultDom.join(''));

                          // 点击结案
                          $(".J_jieAn").click(function (even) {
                            var id = $(even.currentTarget).parent().data('id')
                            var from = $(even.currentTarget).parent().data('from')
                            var chat_content = {
                              'uid': DATA.userInfo.uid,    //发送方id
                              'userName': DATA.userInfo.uname,   //发送
                              'toUId': from,      //接收方id
                              'toUName': '接收人',
                              'content': '已接警'
                            };
                            ws_alarm_monitor.send(JSON.stringify(chat_content));

                            alarmData.filter(function (x) {
                              return x.datetime===id
                            })[0].status = 2
                            DOM.rightMenu.alarm.received.update();
                            DOM.rightMenu.alarm.processing.update();
                          })


                          // alarmData.filter(function (x) {
                          //   return x.datetime===id
                          // })[0].status = 2
                          // DOM.rightMenu.alarm.received.update();
                          // DOM.rightMenu.alarm.processing.update();
                        }
                    }
                },
                processed: {        // 结案，处理完成的报警
                    id: "alarm-processed-list",
                    update: function(){
                      var tmp = '<li class="fz_0 dis_fx over_h">'+
                                ' <i class="dis_ib ver_m icon"></i>'+
                                ' <span class="dis_ib ver_m font14 flex1 ellipsis">@datetime@</span>'+
                                ' <span class="dis_ib ver_m font14 flex1 ellipsis">@name@</span>'+
                                '</li>',
                        // var tmp = '<p data-id="@id@">@datetime@&emsp;<i class="fa @icon@"></i><span class="alarm-user-name">@name@</span></p>',
                            alarmData = DATA.alarmMQ.data,
                            resultDom = [];
                            DATA.dunanInfo.alarmEndNum = alarmData.length 
                            $(".data_alarmend_num").html(DATA.dunanInfo.alarmEndNum+'个')
                            //console.log('dsd'+DATA.dunanInfo.alarmEndNum) 


                        if(!_.isEmpty(alarmData)) {
                            // 过滤结案数据
                            var processed = _.filter(alarmData, function(item, index){
                                return item.status === 2;
                            });

                            if(processed.length === 0){
                                resultDom.push('<p class="no-data"><i class="fa fa-exclamation-circle"></i>无已结案报警</p>');
                            }else {
                                _.forEach(processed, function (item, index) {
                                    var dateTime = new Date(item.datetime).format('yyyy-MM-dd HH:mm:ss'),
                                        userName = "",
                                        icon = "";     // 默认是PDA报警

                                    if (_.eq(item.type, 0)) {
                                        icon = DOM.rightMenu.alarm.icon.PDA;
                                        userName = item.userInfo.idcard.name;
                                    } else if (_.eq(item.type, 3)) {
                                        icon = DOM.rightMenu.alarm.icon.GPS;
                                        userName = item.content.deviceName;
                                    }

                                    resultDom.push(tmp.replace("@id@", item._id)
                                        .replace("@datetime@", dateTime)
                                        .replace("@icon@", icon)
                                        .replace("@name@", userName)
                                    );
                                });
                            }
                            $("#"+ DOM.rightMenu.alarm.processed.id).html(resultDom.join(''));
                        }
                    }
                }
            },
            escortVehicles: {       // 押运车辆
                id: "escortVehicles",
                count: {
                    id: "escortVehicles_count"
                },
                expand: function () {
                    if(!$("#"+DOM.rightMenu.escortVehicles.count.id).parents("dl").hasClass("am-active")){
                        $("#"+DOM.rightMenu.escortVehicles.count.id).parent().click();
                    }
                },
                update: function () {       // 更新右侧菜单中的押运车辆列表
                    // 按车速降序排列
                    var sortedData = _.sortBy(DATA.escortVehicles.all, function(item){
                        return -Number(item.speed);
                    });
                    // 再按照是否报警排序
                    sortedData = _.sortBy(sortedData, function(item){
                        return item.alarm;
                    });
                    // 统计数量
                    $("#"+DOM.rightMenu.escortVehicles.count.id).text(sortedData.length);
                    var carListData = DATA.escortVehicles.carList
                    var _domResult = [];
                    for (var i = 0, data = sortedData; i < data.length; i++) {
                        
                        // (function (k) {
                        //     for(var j in DATA.escortVehicles.selected){
                        //         console.log(data[k]['original']['_id'])
                        //         var rows2 = DATA.escortVehicles.selected[j]
                        //         if(data[k]['original']['_id']==rows2.classify.imei){
                        //             data[k]['original']['car_id']=rows2._id   
                                    
                        //         }
                        //     }
                        // })(i);
                        var oriStr = JSON.stringify(data[i])
                        var domTmp = '<li data-original=\''+oriStr+'\' class="@textStyle@" data-id="@_id@" data-coordinate="@lng@,@lat@">@carName@</li>',
                            textStyle = "";

                        if(data[i].alarm){            //车辆报警
                            textStyle = "am-text-danger"
                        }else if (data[i].accStatus === "0" || data[i].speed === 0) {  //车辆未点火,GPS不在线,将速度置为0
                            textStyle = "";
                        } else if (data[i].speed > 0 && data[i].speed <= shendun.global.SPEED_LIMIT && data[i].status === "1") {     //车速小于限速,且GPS在线,即正常行驶中
                            textStyle = "am-text-success";
                        } else if(data[i].speed > shendun.global.SPEED_LIMIT) {                            //超速车辆
                            textStyle = "am-text-warning";
                        }
                       // var carList_item = _find(carListData,{}) 
                       (function(a) {  
                          for(var j in carListData){
                              //console.log(j)
                              if(data[a]._id == carListData[j].classify.imei){
                                data[a].deviceName = carListData[j].name
                              }
                          }    
                         
                        })(i)
                        _domResult.push(domTmp
                            .replace(/@textStyle@/g, textStyle)
                            .replace(/@lng@/g, data[i].lng)
                            .replace(/@lat@/g, data[i].lat)
                            .replace(/@_id@/, data[i]._id)
                            .replace(/@carName@/g, data[i].deviceName))
                        ;
                    }
                    if(carListData.length > sortedData.length){ 
                        for(var i in carListData){
                            
                            var rows = carListData[i]
                            if(rows.classify.imei==""||rows.count==0){
                                _domResult.push(domTmp
                                    .replace(/@textStyle@/g, "") 
                                    .replace(/@lng@/g, " ")
                                    .replace(/@lat@/g, " ")
                                    .replace(/@_id@/, "")
                                    .replace(/@carName@/g, rows.name))   
                                ; 
                            }
                        }
                    }
                    $("#"+ DOM.rightMenu.escortVehicles.id).html(_domResult.join(""));
                    // TODO 注入点击车辆事件
                  var $rightMenu = $("#viewThree");
                  $("#escortVehicles li").click(function(even){ 
                      //alert(even.which)
                        var original = even.target.dataset.original
                        var coordinate = even.target.dataset.coordinate
                    // console.log(JSON.parse(original)) 
                        BDMap.showInfoWindow({original:JSON.parse(original)}); 
                        $(this).parent().parent().find(".cat_active").removeClass('cat_active')
                        $(this).addClass('cat_active')
                        var coordinate = $(this).attr("data-coordinate").split(",");
                        BDMap.focus(coordinate[0],coordinate[1]);
                        // 加载车辆任务
                        var _id = $(this).data('id')
                        add_task_id = _id
                        $("#carTaskWD").html('')
                        $("#carTaskSB").html('')
                        $("#carTaskRY").html('')  
                        $("#checkerUL").html('')
                        $("#carTask").html('')
                        DATA.escortVehicles.loadTaskInfo(_id.toString());  
            
                    
                  })
                   
                //   $rightMenu.on('click', "#"+DOM.rightMenu.escortVehicles.id+ " li", function(even){
                //     var original = even.target.dataset.original
                //     BDMap.showInfoWindow({original:JSON.parse(original)});
                //     $(this).parent().parent().find(".cat_active").removeClass('cat_active')
                //     $(this).addClass('cat_active')
                //     var coordinate = $(this).attr("data-coordinate").split(",");
                //     BDMap.focus(coordinate[0],coordinate[1]);
                //     // 加载车辆任务
                //     var _id = $(this).data('id')
                //     $("#carTaskWD").html('')
                //     $("#carTaskSB").html('')
                //     $("#carTaskRY").html('')
                //     $("#checkerUL").html('')
                //     $("#carTask").html('')
                //     DATA.escortVehicles.loadTaskInfo(_id.toString());
                //   });


                }
            },
            staffs: {
                id: "staffs",
                count: {
                    id: "staff_count"
                },
                expand: function () {
                    // 展开人员列表
                    if(!$("#"+DOM.rightMenu.staffs.count.id).parents("dl").hasClass("am-active")){
                        $("#"+DOM.rightMenu.staffs.count.id).parent().click();
                    }
                },
                update: function () {       // 更新右侧菜单中的人员列表
                    // 按人员职务排列
                    var sortedData = DATA.staffs.all.sort(function(item1, item2){
                        return _.indexOf(shendun.global.STAFF_POSITION, item1.position) - _.indexOf(shendun.global.STAFF_POSITION, item2.position);
                    });

                    // 统计数量
                    $("#"+DOM.rightMenu.staffs.count.id).text(sortedData.length);

                    var _domResult = [];
                    for (var i = 0, data = sortedData; i < data.length; i++) {
                        
                        var domTmp = '<li class="staff-item" data-id="@_id@" data-info=@info@>' +
                            '<span class="staff-name">@name@</span>' +
                            '<i class="fa @gender@"></i>' +
                            '<span class="staff-position">@position@</span>' +
                            '<i class="fa fa-crosshairs @permission@" title="@permission-title@"></i>' +
                            '</li>',
                            gender = "fa-male",     // 默认男性
                            permissionTitle = "不可持枪",
                            permission = "";        //默认不可持枪

                        if(data[i].idcard.sex === "男"){
                            gender = "fa-male";
                        }else{
                            gender = "fa-female";
                        }

                        if (data[i].can_hold_gun) {  //可以持枪
                            permission = "permission";
                            permissionTitle = "可持枪";
                        } else {
                            permission = "";
                            permissionTitle = "不可持枪"
                        }
                        var _info = {
                            'name':data[i].idcard.name,
                            'position':data[i].position,
                            'phone':data[i].contacts[0].contacts,
                            'sex':gender
                        }
                        console.log(JSON.stringify(_info))
                        _domResult.push(domTmp
                            .replace(/@info@/g,JSON.stringify(_info))
                            .replace(/@_id@/g, data[i]._id)
                            .replace(/@name@/g, data[i].idcard.name)
                            .replace(/@gender@/g, gender)
                            .replace(/@position@/g, data[i].position)
                            .replace(/@permission@/g, permission)
                            .replace(/@permission-title@/g, permissionTitle)
                        );
                    }

                    $("#staffUl").html(_domResult.join(""));
                    $("li.staff-item").contextMenu({  
                        width: 110, // width
                        itemHeight: 30, // 菜单项height
                        bgColor: "#333", // 背景颜色
                        color: "#fff", // 字体颜色
                        fontSize: 12, // 字体大小 
                        hoverBgColor: "#4777f5", // hover背景颜色
                        target: function(ele) { // 当前元素
                            console.log(ele.context);
                            var that = $(ele.context)
                            $(".staff-info-model-edit").fadeOut()
                            that.addClass('active').siblings('.staff-item').removeClass('active')
                            var _info = JSON.parse(that.attr('data-info'))
                            var _original = that.attr('data-id')
                            $(".staff-info-model-edit .submit-info-btn").attr('data-id',_original)
                            $(".info-name").text(_info.name)
                            $(".info-position").text(_info.position)
                            $(".info-phone").text(_info.phone) 
                        },
                        menu: [{ // 菜单项 
                                text: "编辑",
                                // icon: "img/add.png",
                                callback: function() {
                                    //console.log(ele)
                                    $(".staff-info-model-edit").fadeIn() 
                                    
                                    // $(this).addClass('active').siblings('.staff-item').removeClass('active')
                                    // var _info = JSON.parse($(this).attr('data-info')) 
                                    // $(".info-name").text(_info.name)
                                    // $(".info-position").text(_info.position)
                                    // $(".info-phone").text(_info.phone) 
                                }
                            },
                            // {
                            //     text: "复制",
                            //     // icon: "img/copy.png",
                            //     callback: function() {
                            //         alert("复制");
                            //     }
                            // }, 
                            // {
                            //     text: "粘贴",
                            //     // icon: "img/paste.png",
                            //     callback: function() { 
                            //         alert("粘贴");
                            //     }
                            // },
                            {
                                text: "删除",
                                // icon: "img/del.png",
                                callback: function() {
                                    alert("删除");
                                }
                            }
                        ]
                
                    });   
                    DOM.rightMenu.open();
                    // DOM.rightMenu.staffs.expand();
                }
            },
            overspeedLog: {
                id: "overspeedLog",
                update: function () {
                    for (var i = 0; i < DATA.overspeedLog.all.length; i++) {
                        DOM.rightMenu.overspeedLog.append(DATA.overspeedLog.all[i]);
                    }
                },
                append: function (o) {
                    $("#" + DOM.rightMenu.overspeedLog.id).append('<li class="am-g">' + new Date(o.date_time).format("HH:mm:ss") + ' ' + o.lpn + ' <span style="color: #FFD77E">' + o.speed + 'km/h</span></li>');
                },
                size: {
                    id: "overspeedLog_size",
                    update: function () {
                        $("#" + DOM.rightMenu.overspeedLog.size.id).html(DATA.overspeedLog.all.length);
                    }
                },
                speedlimit: {
                    id: "overspeedLog_speedlimit",
                    update: function () {
                        if (DATA.overspeedLog.speedlimit.value) {
                            $("#" + DOM.rightMenu.overspeedLog.speedlimit.id).html("限速" + DATA.overspeedLog.speedlimit.value);
                        }
                    }
                }
            }
        },
        infoPanel: {   
            id: 'info-panel-tabs',
            controlDoms: {
                infoPanelTabsNav: "js-info-panel-tabs-nav",
                lineInfo : "js-line-info",
                taskInfo : "js-task-info",
                taskBaseInfo : "js-task-base-info",
                taskStaffs : "js-task-staffs",
                taskAssets : "js-task-assets"
            },
            tmp:
            '<div class="am-tabs am-tabs-d2 info-panel-tabs" data-am-widget="tabs" id="info-panel-tabs">'+
            '<div class="am-tabs-bd" style="overflow-y: hidden">'+
            '<div style="width: 50%;height: 338px;float:left;color: #34aaf0;font-size: 18px;text-align: center;margin-top: 20px;" id="tabCarVideoA">@tabCarVideoA@</div>'+
            '<div style="width: 50%;height: 338px;float:left;color: #34aaf0;font-size: 18px;text-align: center;margin-top: 20px;" id="tabCarVideoB">@tabCarVideoB@</div>'+
            '<ul class="am-tab-panel am-in am-active" style="padding:20px 0" id="tab-locations">'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;">车辆名称：@device-name@</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;">时间：@gps-time@</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;">经度：@lng@</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;">速度：@speed@ km/h</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;">纬度：@lat@</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;">imei:@device-imei@</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;max-height: 300px;" class="js-curr-address">位置：</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;" class="js-curr-task">任务：</li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;"></li>'+
            '<li style="padding: 5px 15px;font-size: 16px;width: 50%;float:left;" class="js-curr-carBoss">司机：</li>'+
            '</ul>'+
            '<p class="layer-btn-box" id="" data="@imei@">'+
            '<a class="am-margin-left his-track-link" style="height: 20px;font-size: 18px;cursor:pointer!important;color:#666;" target="_blank" onclick="window.open(\'track.html?c=@clientId@&t=@token@&imei=@imei@&name=@device-name@\')">历史轨迹</a>'+
            '<span style="float:right; display: inline-block; width: 40px; height: 20px; font-size: 18px; color: red;margin-right: 20px;margin-top: 0px;cursor:pointer" id="closeCarInfo" >关闭</span>'+
            '<span style="float:right; display: inline-block; width: 80px; height: 20px; font-size: 18px; color: red;margin-right: 20px;margin-top: 0px;cursor:pointer" id="sendMsgBtn" >发短信</span>'+
            '</p>'+
            '<div class="am-tab-panel am-fade" id="tab-videos">'+
            '@videoPlayBox@'+
            '</div>'+
            '<div class="am-tab-panel am-fade tab-tasks" id="tab-tasks">'+ 
            '<div class="am-g">' +
            '       <div class="am-u-lg-4">' +
            '           <ul id="tasks-tree" class="ztree tasks-tree"></ul>' +
            '       </div>' +
            '    <div class="am-u-lg-8">' +
            '        <!--任务信息: 基础信息, 人员信息, 资产信息-->' +
            '        <div class="am-tabs task-info js-task-info">' +
            '            <section data-am-widget="accordion" class="am-accordion am-accordion-default" data-am-accordion=\'{ "multiple": true }\'>' +
            '               <dl class="am-accordion-item am-active">' +
            '                   <dt class="am-accordion-title">基本信息</dt>' +
            '                   <dd class="am-accordion-bd am-collapse am-in">' +
            '                       <div class="am-accordion-content">' +
            '                           <ul class="am-list am-list-static am-list-striped js-task-base-info"></ul>' +
            '                       </div>' +
            '                    </dd>' +
            '               </dl>' +
            '           </section>' +
            '        </div>' +
            '        <!--线路信息-->' +
            '        <div class="am-hide js-line-info" >' +
            '           <section data-am-widget="accordion" class="am-accordion am-accordion-default" data-am-accordion=\'{ "multiple": true }\'>' +
            '                  <dl class="am-accordion-item am-active">' +
            '                      <dt class="am-accordion-title">网点信息</dt>' +
            '                      <dd class="am-accordion-bd am-collapse am-in">' +
            '                          <div class="am-accordion-content">' +
            '                              <ul class="am-list am-list-static am-list-striped line-info"></ul>' +
            '                          </div>' +
            '                       </dd>' +
            '                  </dl>' +
            '           </section>' +
            '        </div>' +
            '    </div>' +
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>',

            //修改任务数据,供ztree绘制使用
            formatTaskDataForTree:function (data){
                if(data.length === 0){
                    return;
                }

                data.forEach(function(item){
                    item.name = item.LineName;
                    var sortedLines = _.sortBy(item.lines, "no");
                    item.children = sortedLines;
                });

                return data;
            },
            // task ztree 节点点击事件
            onTasksNodeClick: function (event, treeId, treeNode){
                if(treeNode.level === 0){   //根节点
                    DOM.infoPanel.render_task_base_info(treeNode);
                    DOM.infoPanel.render_task_staffs_info(treeNode.staffs);
                    DOM.infoPanel.render_task_assets_info(treeNode.goods);

                    $("."+DOM.infoPanel.controlDoms.taskInfo).removeClass('am-hide');
                    $("."+DOM.infoPanel.controlDoms.lineInfo).addClass('am-hide');
                }else{
                    DOM.infoPanel.render_line_info(treeNode);
                    $("."+DOM.infoPanel.controlDoms.lineInfo).removeClass('am-hide');
                    $("."+DOM.infoPanel.controlDoms.taskInfo).addClass('am-hide');
                }
            },
            // 渲染任务tree相关的基础信息
            render_task_base_info: function (data){
                var tmp = '<li>' +
                    '                        <span class="item-title am-text-right">线路名称:</span>' +
                    '                        <span class="item-content">@lineName@</span>' +
                    '                    </li>' +
                    '                    <li>' +
                    '                        <span class="item-title am-text-right">任务类型:</span>' +
                    '                        <span class="item-content">@taskType@</span>' +
                    '                    </li>' +
                    '                    <li>' +
                    '                        <span class="item-title am-text-right">中队名称:</span>' +
                    '                        <span class="item-content">@emuName@</span>' +
                    '                    </li>' +
                    '                    <li>' +
                    '                        <span class="item-title am-text-right">日期:</span>' +
                    '                        <span class="item-content">@planDate@</span>' +
                    '                    </li>' +
                    '                    <li>' +
                    '                        <span class="item-title am-text-right">计划起止时间:</span>' +
                    '                        <span class="item-content">@planDuration@</span>' +
                    '                    </li>' +
                    '                    <li>' +
                    '                        <span class="item-title am-text-right">实际起止时间:</span>' +
                    '                        <span class="item-content">@actualDuration@</span>' +
                    '                    </li>';
                var planDate = new Date(data.Date).format('yyyy-MM-dd'),
                    planDuration = new Date(data.Start).format('HH:mm:ss') + ' - ' + new Date(data.Finish).format('HH:mm:ss'),
                    actualDuration = new Date(data.ActualStart).format('HH:mm:ss') + ' - ' + new Date(data.ActualFinish).format('HH:mm:ss');
                var resultDom = tmp.replace(/@lineName@/g, data.LineName)
                    .replace(/@taskType@/g, data.TaskType)
                    .replace(/@emuName@/g, data.EmuName)
                    .replace(/@planDate@/g, planDate)
                    .replace(/@planDuration@/g, planDuration)
                    .replace(/@actualDuration@/g, actualDuration);

                $("."+DOM.infoPanel.controlDoms.taskBaseInfo).html(resultDom);
            },

            // 渲染任务相关的员工信息
            render_task_staffs_info: function (data){
                var tmp = '<tr>'+
                    '<td>@name@</td>'+
                    '<td>@staffId@</td>'+
                    '<td>@position@</td>'+
                    '<td>@gender@</td>'+
                    '<td>@contact@</td>'+
                    '</tr>',
                    resultDom = [];

                _.forEach(data, function(item){
                    var _itemDom = tmp.replace("@name@", item.idcard.name)
                        .replace("@staffId@", item.code)
                        .replace("@position@", item.position)
                        .replace("@gender@", item.idcard.sex)
                        .replace("@contact@", item.contacts[0].contacts);
                    resultDom.push(_itemDom);
                });

                $("."+DOM.infoPanel.controlDoms.taskStaffs).find("tbody").html(resultDom.join(''));
            },

            // 渲染任务相关的资产信息
            render_task_assets_info: function (data){
                var tmp = '<tr>'+
                    '<td>@name@</td>'+
                    '<td>@model@</td>'+
                    '<td>@type@</td>'+
                    '<td>@count@</td>'+
                    '<td>@code@</td>'+
                    // '<td>@beginTime@</td>'+
                    '</tr>',
                    resultDom = [];

                _.forEach(data, function(item){
                    // var time = new Date(item.BeginTime).format("yyyy-MM-dd HH:mm:ss");

                    var _itemDom = tmp.replace("@name@", item.name)
                            .replace("@model@", item.model)
                            .replace("@type@", item.type)
                            .replace("@count@", item.count)
                            .replace("@code@", item.code)
                        // .replace("@beginTime@", time)
                    ;

                    resultDom.push(_itemDom);
                });
                $("."+DOM.infoPanel.controlDoms.taskAssets).find("tbody").html(resultDom.join(''));
            },

            // 渲染任务网点信息
            render_line_info: function (data){
                var tmp = '<li>' +
                    '        <span class="item-title am-text-right">名称:</span>' +
                    '        <span class="item-content">@name@</span>' +
                    '    </li>' +
                    '    <li>' +
                    '        <span class="item-title am-text-right">地址:</span>' +
                    '        <span class="item-content">@address@</span>' +
                    '    </li>' +
                    '    <li>' +
                    '        <span class="item-title am-text-right">类型:</span>' +
                    '        <span class="item-content">@type@</span>' +
                    '    </li>' +
                    '    <li>' +
                    '        <span class="item-title am-text-right">坐标:</span>' +
                    '        <span class="item-content">@coordinates@</span>' +
                    '    </li>' +
                    '    <li>' +
                    '        <span class="item-title am-text-right">配送交接:</span>' +
                    '        <span class="item-content">@behavior@</span>' +
                    '    </li>' +
                    '    <li>' +
                    '        <span class="item-title am-text-right">交接人员:</span>' +
                    '        <span class="item-content">@handovers@</span>' +
                    '    </li>' +
                    '    <li>' +
                    '        <span class="item-title am-text-right">更新时间:</span>' +
                    '        <span class="item-content">@updateDateTime@</span>' +
                    '    </li>';
                var coordinate = data.coordinates.join(','),
                    updateTime = (new Date(data.UpdateDateTime)).format('yyyy-MM-dd HH:mm:ss'),
                    handovers = [];

                _.forEach(data.checker, function(item){
                    handovers.push('<i class="fa fa-user"></i> ' + item.name+" - "+item.owner);
                });

                var resultDom = tmp.replace(/@name@/g, data.name)
                    .replace(/@address@/g, data.address)
                    .replace(/@type@/g, data.type)
                    .replace(/@coordinates@/g, coordinate)
                    .replace(/@behavior@/g, data.behavior)
                    .replace(/@handovers@/g, handovers.join('<br/>'))
                    .replace(/@updateDateTime@/g, updateTime);

                $("."+DOM.infoPanel.controlDoms.lineInfo+" .am-list").html(resultDom);
            }
        },
        videoControl: {
            isServiceAvaliable: function(){
                if(!DATA.videoService.isSignIn){
                    // $alertModal.find(".am-modal-bd").text("视频服务异常!");
                    // $alertModal.modal();
                    return false;
                }else{
                    return true;
                }
            }
        },
        chat: {
            chatRecordTmp: '<div class="record-item @recordDirectionClass@">' +
            '            <p class="owner-info">' +
            '                <span class="staff-name">@userName@</span>' +
            '                <span class="section-chat-time">@time@</span>' +
            '            </p>' +
            '            <div class="am-g"><p class="record-content">@content@</p></div>' +
            '        </div>',
            contentId: "chat-content",
            open: function(data){
                var recordDirectionClass = "",
                    chatRecordResult = [];

                _.forEach(DATA.chat.data, function(item, index){
                    if(item.uid === DATA.userInfo.uid){
                        recordDirectionClass = "record-self";
                    }else{
                        recordDirectionClass = "record-other";
                        DATA.chat.other = item;
                    }
                    chatRecordResult.push(DOM.chat.chatRecordTmp.replace("@recordDirectionClass@", recordDirectionClass)
                        .replace("@userName@", item.userName)
                        .replace("@time@", item.time)
                        .replace("@content@", item.content)     // 需过滤js代码,html标签等
                    );
                });

                layer.open({
                    type: 1 //Page层类型
                    ,area: ['600px', '600px']
                    ,title: '<div class="chat-header">' +
                    '           <span class="staff-name"><i class="fa fa-user"></i> '+ DATA.chat.other.toUserName +'</span>' +
                    // '           <span class="staff-position">中队长</span>' +
                    '       </div>'
                    ,shade: false //遮罩透明度
                    ,maxmin: true //允许全屏最小化
                    ,anim: 1 //0-6的动画形式，-1不开启
                    ,content: '<div class="chat-record js-chat-record">' + chatRecordResult.join('') + '</div>' +
                    '    <div class="chat-input-panel">' +
                    '        <textarea name="" id="chat-content"></textarea>' +
                    '    </div>' +
                    '    <div class="chat-send-panel" data-id="'+item._id+'">' +
                    '       <span class="comment">shift+Enter换行</span>' +
                    '       <button class="am-btn am-btn-primary am-round" id="chat-submit" type="button">发送</button>' +
                    '    </div>'
                });
            },
            update: function(data){
                var recordDirectionClass = "";

                if(data.uid === DATA.userInfo.uid){
                    recordDirectionClass = "record-self";
                }else{
                    recordDirectionClass = "record-other";
                }
                DOM.chat.chatRecordTmp.replace("@recordDirectionClass@", recordDirectionClass)
                    .replace("@userName@", data.userName)
                    .replace("@time@", data.time)
                    .replace("@content@", data.content)     // 需过滤js代码,html标签等
                ;

                $(".js-chat-record").append(DOM.chat.chatRecordTmp);
            }
        },
        other: {
            notification: {
                id: "notification",
                type: {"sucess": "am-alert-success", "warning":"am-alert-warning", "danger":"am-alert-danger", "normal":"am-alert-secondary", "primary":""},
                init: function () {
                    var top = document.getElementById(DOM.header.id).offsetHeight + 1;
                    $("#" + DOM.other.notification.id).css("top", top);
                },
                show: function (content, type) {
                    var marquee = '<marquee direction="left" behavior="scroll" scrollamount="15" scrolldelay="60" loop="1" hspace="20">' + content + '</marquee>';
                    $("#" + DOM.other.notification.id).addClass(type).append(marquee);
                },
                clear: function () {
                    $("#" + DOM.other.notification.id).html('');
                }
            },
            screen: {//全屏切换按钮
                id: "screen",
                addClickListener: function () {//右下角全屏图标点击事件
                    var showDom = function () {
                        //$("#"+DOM.header.id+", #"+DOM.footer.id).show();
                        $("#" + DOM.other.screen.id).css({"background": "url(assets/images/screen.png)"});
                    }
                    var hideDom = function () {
                        //$("#"+DOM.header.id+", #"+DOM.footer.id).hide();
                        $("#" + DOM.other.screen.id).css({"background": "url(assets/images/screensmall.png)"});
                    }
                    var toBeFull = function () {
                        var docElm = document.documentElement;
                        if (docElm.requestFullscreen) {
                            docElm.requestFullscreen();
                        } else if (docElm.mozRequestFullScreen) {
                            docElm.mozRequestFullScreen();
                        } else if (docElm.webkitRequestFullScreen) {
                            docElm.webkitRequestFullScreen();
                        } else if (docElm.msRequestFullscreen) {
                            docElm.msRequestFullscreen();
                        }
                    }
                    var exitFull = function () {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        }
                        else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        }
                        else if (document.webkitCancelFullScreen) {
                            document.webkitCancelFullScreen();
                        }
                        else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        }
                    }
                    $("#" + DOM.other.screen.id).on("click", function () {
                        if ($("#" + DOM.other.screen.id).hasClass("on")) {
                            showDom();
                            exitFull();
                        } else {
                            hideDom();
                            toBeFull();
                        }
                        $(this).toggleClass("on");
                    });
                    document.addEventListener("fullscreenchange", function () {
                        if (!document.fullscreen && $("#" + DOM.other.screen.id).hasClass("on")) {
                            showDom();
                        }
                        DOM.initLeftMenu();
                    }, false);
                    document.addEventListener("mozfullscreenchange", function () {
                        if (!document.mozFullScreen && $("#" + DOM.other.screen.id).hasClass("on")) {
                            showDom();
                        }
                        DOM.initLeftMenu();
                    }, false);

                    document.addEventListener("webkitfullscreenchange", function () {
                        if (!document.webkitIsFullScreen && $("#" + DOM.other.screen.id).hasClass("on")) {
                            showDom();
                        }
                        DOM.initLeftMenu();
                    }, false);
                    document.addEventListener("msfullscreenchange", function () {
                        if (!document.msFullscreenElement && $("#" + DOM.other.screen.id).hasClass("on")) {
                            showDom();
                        }
                        DOM.initLeftMenu();
                    }, false);
                }
            },
            noData: {
                msg: '',
                defaultFaClass: 'fa fa-exclamation-circle',
                faClass: '',
                tmp: '<p class="no-data"><i class="@faClass@"></i>@msg@</p>',
                set: function(params){
                    DOM.other.noData.faClass = params.faClass ? params.faClass : DOM.other.noData.defaultFaClass;
                    DOM.other.noData.msg = params.msg;
                    return DOM.other.noData.tmp.replace('@faClass@', DOM.other.noData.faClass).replace('@msg@', DOM.other.noData.msg);
                }
            },
            videoPlayBox: {
                tmp: '<div id="play-box-@index@" class="video-play-box"></div>',
                set: function(index){
                    return DOM.other.videoPlayBox.tmp.replace('@index@', index);
                }
            },
            videoPlayListBox: {
                tmp: '<div id="play-list-box-@index@" class="video-play-box"></div>',
                set: function(index){
                    return DOM.other.videoPlayListBox.tmp.replace('@index@', index);
                }
            },
            //向ztree每个父节点node name后边添加子节点个数
            addTotalChildsNum: function(treeNode){
                var $treeNode = $("#"+treeNode.tId+ "_a"),
                    totalChildsTmp = '<span class="total-childs">@totalChilds@</span>';
                if(treeNode.isParent && $treeNode.find(".total-childs").length === 0){
                    var totalChildsDom = totalChildsTmp.replace('@totalChilds@', treeNode.children.length);
                    $treeNode.append(totalChildsDom);
                }
            }
        }
    };

    // 获取技防报警
    function getJiFangAlarms() {
        var _data = {
            "filter": {
                "Date": new Date().format("yyyy-MM-dd"),
                "ResourceID": 2,
                "TaskType": "技防报警"/*,
                    "projection": {
                        "_id": 1,
                        "Start": 1,
                        "ActualStart": 1,
                        "ActualFinish": 1,
                        "Safety": 1
                    }*/
            }
        };
        $.when(request.Post("common/find/task", _data))
            .done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    var b = new Date(data[i].Start).getTime();
                    var cTime, bTime, dTime, fTime;

                    if ((data[i].Start).toString().length === 13) {
                        cTime = new Date(data[i].Start).format("yyyy-MM-dd HH:mm:ss");
                    } else {
                        cTime = data[i].Start;
                    }
                    if ((data[i].ActualStart).toString().length === 13) {
                        bTime = new Date(data[i].ActualStart).format("yyyy-MM-dd HH:mm:ss");
                    } else {
                        bTime = data[i].ActualStart;
                    }
                    if ((data[i].ActualFinish).toString().length === 13) {
                        dTime = new Date(data[i].ActualFinish).format("yyyy-MM-dd HH:mm:ss");
                    } else {
                        dTime = data[i].ActualFinish;
                    }
                    if (data[i].Safety.state === "接警") {
                        $("#message" + b).remove();
                        $("#" + DOM.rightMenu.shout.id).find('div[class="am-tabs-bd"]>div:eq(0)').append('<p  ondblclick="peoplejiean(' + b + ')" style="font-size:20px;line-height:30px;" id=message' + b + '  onmouseover="Bjbianse(' + "'" + "message" + b + "'" + ')"  onmouseout="bianse(' + "'" + "message" + b + "'" + ')">报警人：' + data[i].Safety.name + ",&nbsp时间：" + cTime + '<span>个人</span></p>');
                    }
                    if (data[i].Safety.state === "处理") {
                        $("#message" + b).remove();
                        $("#" + DOM.rightMenu.shout.id).find('div[class="am-tabs-bd"]>div:eq(1)').append('<p  ondblclick="peoplejiean(' + b + ')" style="font-size:20px;line-height:30px;" id=message' + b + '  onmouseover="Bjbianse(' + "'" + "message" + b + "'" + ')"  onmouseout="bianse(' + "'" + "message" + b + "'" + ')">报警人：' + data[i].Safety.name + ",&nbsp时间：" + bTime + '<span>个人</span></p>');
                    }
                    if (data[i].Safety.state === "结案") {
                        $("#message" + b).remove();
                        $("#" + DOM.rightMenu.shout.id).find('div[class="am-tabs-bd"]>div:eq(2)').append('<p  ondblclick="peoplejiean(' + b + ')" style="font-size:20px;line-height:30px;" id=message' + b + '  onmouseover="Bjbianse(' + "'" + "message" + b + "'" + ')"  onmouseout="bianse(' + "'" + "message" + b + "'" + ')">报警人：' + data[i].Safety.name + ",&nbsp时间：" + dTime + '<span>结案</span></p>');
                    }
                }
            })
            .fail(function (xhr) {
                console.log(JSON.stringify(xhr));
            });
    }

    // 绘制车辆路径上的任务点
    function showPoly(pointList) {
        //循环显示点对象
        for (var c = 0; c < pointList.length; c++) {
            var marker = new BMap.Marker(pointList[c]);
            _map.addOverlay(marker);
            //将途经点按顺序添加到地图上
            // var label = new BMap.Label(c+1,{offset:new BMap.Size(20,-10)});
            var label = new BMap.Label(c + 1, {offset: new BMap.Size(1, 2)});
            label.setStyle({
                color: "#fff",
                fontSize: "14px",
                backgroundColor: "0.05",
                border: "0",
                fontWeight: "bold",
            });
            marker.setLabel(label);
        }

        var group = Math.floor(pointList.length / 11);
        var mode = pointList.length % 11;

        var driving = new BMap.DrivingRoute(_map, {
            onSearchComplete: function (results) {
                if (driving.getStatus() == BMAP_STATUS_SUCCESS) {
                    var plan = driving.getResults().getPlan(0);
                    var num = plan.getNumRoutes();
                    //alert("plan.num ："+num);
                    for (var j = 0; j < num; j++) {
                        var pts = plan.getRoute(j).getPath();    //通过驾车实例，获得一系列点的数组
                        var polyline = new BMap.Polyline(pts);
                        _map.addOverlay(polyline);
                    }
                }
            }
        });
        for (var i = 0; i < group; i++) {
            var waypoints = pointList.slice(i * 11 + 1, (i + 1) * 11);
            driving.search(pointList[i * 11], pointList[(i + 1) * 11 - 1], {waypoints: waypoints});//waypoints表示途经点
        }
        if (mode != 0) {
            var _waypoints = pointList.slice(group * 11, pointList.length - 1);//多出的一段单独进行search
            driving.search(pointList[group * 11], pointList[pointList.length - 1], {waypoints: _waypoints});
        }
    }

    // 获取企业新闻 和企业通知
    function getHelpContent(){
      var queryParams ={
        "filter": {}
      }
      request.Post("common/find/alarm_staff", queryParams) 
      $.when(request.Post("common/find/help", queryParams))
        .done(function (data) {
          var topHtml =[]
          var bottomHtml = []
          for(var i=0 ;i<data.length;i++){
            var item = data [i]
            if (item.type ==='企业新闻'){
              topHtml.push('<li class="fz_0 dis_fx over_h J_helpLi" data-caption="'+item.caption+'" data-url="'+item.url+'"><i class="dis_ib ver_m icon"></i><span class="tit dis_ib ver_m font14 color_f ellipsis">'+item.caption+'</span><span class="dis_ib ver_m font14 flex1 ellipsis">'+item.content+'</span><i class="date dis_ib ver_m font14">'+item.releaseDate+'</i></li>')
            } else if(item.type ==='通知公告'){
              bottomHtml.push('<li class="fz_0 dis_fx over_h J_helpLi" data-caption="'+item.caption+'" data-id="'+item._id+'"><i class="dis_ib ver_m icon"></i><span class="tit dis_ib ver_m font14 color_f ellipsis">'+item.caption+'</span><span class="dis_ib ver_m font14 flex1 ellipsis">'+item.content+'</span><i class="date dis_ib ver_m font14">'+item.releaseDate+'</i></li>')
            }
          }
          $('#company_news').html(topHtml.join(''))
          $('#company_notice').html(bottomHtml.join(''))

          $(".J_helpLi").dblclick( function (even) {
            $("#new_detail").html($(even.currentTarget).data('caption'))
            $("#new_detail_url").html($(even.currentTarget).data('url'))
            $("#new_detail_url").attr('href',$(even.currentTarget).data('url'))
            $('#news_detail_modal').modal({})
          });
        })
    }
    getHelpContent()

    DOM.init();
    DATA.init();

    /*jshint ignore:start*/
    BDMap_map_init();
    /*jshint ignore:end*/

    function BDMap_map_init() {//初始化地图
        var BASE_SIZE_WIDTH = 10,       //百度地图Size类，水平偏移量基数
            BASE_SIZE_HEIGHT_BOTTOM = document.getElementById(DOM.footer.id).offsetHeight;      //百度地图Size类，左下角工具按钮垂直偏移量基数
        //设置中心点坐标和地图级别
        BDMap_map.centerAndZoom(BDMap.DEFAULT_MAP_CENTER, BDMap.DEFAULT_MAP_LEVEL);
        //开启鼠标滚轮缩放
        //设置主题
        //BDMap_map.setMapStyle({style:'light'});

        //比例尺*/`
        var scaleControl = new BMap.ScaleControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
        scaleControl.setOffset(new BMap.Size(BASE_SIZE_WIDTH + 20, BASE_SIZE_HEIGHT_BOTTOM));
        BDMap_map.addControl(scaleControl);

        //导航控件
        var navigationControl = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT,// 靠左下角位置
            type: BMAP_NAVIGATION_CONTROL_LARGE, // LARGE类型
            enableGeolocation: true, // 启用显示定位
            offset: new BMap.Size(BASE_SIZE_WIDTH, BASE_SIZE_HEIGHT_BOTTOM + 50)
        });
        BDMap_map.addControl(navigationControl);

        //开启矩形选择框
        var styleOptions = {
            strokeColor: "red",    //边线颜色。
            fillColor: "",      //填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight: 2,       //边线的宽度，以像素为单位。
            strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
            fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
            strokeStyle: 'solid' //边线的样式，solid或dashed。
        };
        var drawingManager = new BMapLib.DrawingManager(BDMap_map, {
            isOpen: false, //是否开启绘制模式
            enableDrawingTool: true, //是否显示工具栏
            drawingToolOptions: {
                anchor: BMAP_ANCHOR_BOTTOM_LEFT,
                offset: new BMap.Size(BASE_SIZE_WIDTH + 50, BASE_SIZE_HEIGHT_BOTTOM + 30),
                scale: 1,
                drawingModes: [BMAP_DRAWING_RECTANGLE],
            },
            rectangleOptions: styleOptions
        });
        drawingManager.addEventListener('overlaycomplete', function (e) {
            BDMap_map.removeOverlay(e.overlay);
            if (DATA.escortVehicles.all && DATA.escortVehicles.all.length > 0) {

                var pointsInRect = [];
                for (var i = 0; i < DATA.escortVehicles.all.length; i++) {

                    if (BMapLib.GeoUtils.isPointInRect(new BMap.Point(DATA.escortVehicles.all[i].lng, DATA.escortVehicles.all[i].lat), e.overlay.getBounds())) {
                        pointsInRect.push(DATA.escortVehicles.all[i]);
                    }
                }
                DATA.escortVehicles.selected = pointsInRect;
                DATA.escortVehicles.poll.restart();
            }
        });

        //全景控件
        var panoramaControl = new BMap.PanoramaControl({anchor: BMAP_ANCHOR_BOTTOM_LEFT});
        panoramaControl.setOffset(new BMap.Size(BASE_SIZE_WIDTH + 50, BASE_SIZE_HEIGHT_BOTTOM + 80));
        BDMap_map.addControl(panoramaControl);

        //地图类型
        var mapTypeControl = new BMap.MapTypeControl({
            anchor: BMAP_ANCHOR_BOTTOM_LEFT,
            mapTypes: [BMAP_NORMAL_MAP, BMAP_HYBRID_MAP],//普通+混合
        });
        mapTypeControl.setOffset(new BMap.Size(BASE_SIZE_WIDTH + 50, BASE_SIZE_HEIGHT_BOTTOM + 135));
        BDMap_map.addControl(mapTypeControl);

        //路况信息控件
        var trafficControl = new BMapLib.TrafficControl({
            showPanel: false //是否显示路况提示面板
        });
        trafficControl.setAnchor(BMAP_ANCHOR_BOTTOM_LEFT);
        trafficControl.setOffset(new BMap.Size(BASE_SIZE_WIDTH + 50, BASE_SIZE_HEIGHT_BOTTOM + 160));
        BDMap_map.addControl(trafficControl);

        /* 解析地图信息*/
        BDMap_map.addEventListener("mousemove", function (e) {
            $.when(DATA.getAddressStreet(e.point))
                .done(function(res){
                    document.getElementById('street').innerHTML =  res;
                });
        });

        BDMap_map.addEventListener("rightclick", function(e){
            BDMap.rightclickPoint = e.point;
        });

        //缩略图
        var overviewMapControl = new BMap.OverviewMapControl({
            isOpen: true,
            anchor: BMAP_ANCHOR_BOTTOM_RIGHT
        });
        overviewMapControl.setOffset(new BMap.Size(BASE_SIZE_WIDTH-12, BASE_SIZE_HEIGHT_BOTTOM));
        BDMap_map.addControl(overviewMapControl);

        BDMap_map.setDefaultCursor("url(assets/images/cursor_red_64X64.ico),auto");
        BDMap_map.setDraggingCursor("url(assets/images/cursor_red_64X64.ico),auto");


        //$('#right-video-list,#screen').css('bottom',BASE_SIZE_HEIGHT_BOTTOM);
        //alert($('#footer').height())
    }

    $('#right-video-list-bottom').on('click','a',function(){
       var page = parseInt($(this).attr('data-page'));
        BDMap.getVedioList(page);
    })
    // $('#logout').click(function(){
    //     alert('logout')
    // })
    //模拟哈希表---heyun
function HashTable() {
    var size = 0;
    var entry = new Object();
    this.add = function (key, value) {
        if (!this.containsKey(key)) {
            size++;
        }
        entry[key] = value;
    }
    this.getValue = function (key) {
        return this.containsKey(key) ? entry[key] : null;
    }
    this.remove = function (key) {
        if (this.containsKey(key) && (delete entry[key])) {
            size--;
        }
    }
    this.containsKey = function (key) {
        return (key in entry);
    }
    this.containsValue = function (value) {
        for (var prop in entry) {
            if (entry[prop] == value) {
                return true;
            }
        }
        return false;
    }
    this.getValues = function () {
        var values = new Array();
        for (var prop in entry) {
            values.push(entry[prop]);
        }
        return values;
    }
    this.getKeys = function () {
        var keys = new Array();
        for (var prop in entry) {
            keys.push(prop);
        }
        return keys;
    }
    this.getSize = function () {
        return size;
    }
    this.clear = function () {
        size = 0;
        entry = new Object();
    }
}
    //弹窗拖动
    //声明需要用到的变量
    var mx = 0,my = 0;      //鼠标x、y轴坐标（相对于left，top）
    var dx = 0,dy = 0;      //对话框坐标（同上）
    var isDraging = false;      //不可拖动
    var mx2 = 0,my2 = 0;      //鼠标x、y轴坐标（相对于left，top）
    var dx2 = 0,dy2 = 0;      //对话框坐标（同上）
    var isDraging2 = false;      //不可拖动
    $dialog = $("#carInfoWindow")
    $dialog2 = $(".alarm-modal")
    //鼠标按下
    $("#carInfoWindow").mousedown(function(e){
        //console.log('mousedown')
        e.stopPropagation()
        e = e || window.event;
        mx = e.pageX;     //点击时鼠标X坐标
        my = e.pageY;     //点击时鼠标Y坐标
        dx = $dialog.position().left;
        dy = $dialog.position().top;
        isDraging = true;      //标记对话框可拖动                
    });
    //鼠标按下
    $(".alarm-modal").mousedown(function(e){
        //console.log('mousedown')
        e.stopPropagation()
        e = e || window.event;
        mx2 = e.pageX;     //点击时鼠标X坐标
        my2 = e.pageY;     //点击时鼠标Y坐标
        dx2 = $dialog2.position().left;
        dy2 = $dialog2.position().top; 
        isDraging2 = true;      //标记对话框可拖动                
    });

    //鼠标移动更新窗口位置
    $(document).mousemove(function(e){ 
       // e.stopPropagation()
       if(isDraging){
        //$dialog.css("cursor","pointer");
       }
        var e = e || window.event;
        var x = e.pageX;      //移动时鼠标X坐标
        
        var y = e.pageY;      //移动时鼠标Y坐标
        // console.log('x:'+x)
        // console.log('y:'+y)
        if(isDraging){        //判断对话框能否拖动
            var moveX = dx + x - mx;      //移动后对话框新的left值
            var moveY = dy + y - my;      //移动后对话框新的top值
            $dialog.css({"left":moveX + 'px',"top":moveY + 'px'}); 
        };
        if(isDraging2){        //判断对话框能否拖动
            var moveX2 = dx2 + x - mx2;      //移动后对话框新的left值
            var moveY2 = dy2 + y - my2;      //移动后对话框新的top值
            $dialog2.css({"left":moveX2 + 'px',"top":moveY2 + 'px'}); 
        };
    });
 
    //鼠标离开
    $("#carInfoWindow").mouseup(function(e){  
        isDraging = false; 
    });
    //鼠标离开
    $(".alarm-modal").mouseup(function(e){  
        isDraging2 = false; 
    });
    //人员弹窗
    $("#staffUl").on('mousedown','li.staff-item',function(even){
        even.stopPropagation()
        even.preventDefault()
        if(1 == even.which){
            $(".staff-info-model").fadeIn() 
            $(this).addClass('active').siblings('.staff-item').removeClass('active')
            var _info = JSON.parse($(this).attr('data-info')) 
            $(".info-name").text(_info.name)
            $(".info-position").text(_info.position)
            $(".info-phone").text(_info.phone)
        }else if(3 == even.which){
            var updateParams = {
                position:'中队长2'
            };
            var update_alarm_params = {
                filter: {_id: '59b3c7bced5e691cf891472e'},
                update: {
                    "$set":updateParams   
                }
            }
            // $.when(request.Post("common/updateOne/staff", update_alarm_params)) 
            // .done(function (data) { 
            //     console.log(data) 
            // })
        }

    })

    $(".submit-info-btn").click(function(e){
        console.log($(this).attr('data-id'))
        var _editinfo = $(".staff-info-model-edit")
        var updateParams = {
            idcard:{
                name:$(".staff-info-model-edit .info-name").text()
            },
            position:$(".staff-info-model-edit .info-position").text(), 
            contacts:[
                {contacts:$(".staff-info-model-edit .info-phone").text()}
            ]
        };
        var update_alarm_params = {
            filter: {_id: $(this).attr('data-id')}, 
            update: {
                "$set":updateParams  
            }
        }
        $.when(request.Post("common/updateOne/staff", update_alarm_params)) 
        .done(function (data) { 
            console.log(data) 
            var request_get_staff_params = {
                filter: {struct_id: treeClickNodeId}
            };
            $.when(request.Post("common/find/staff", request_get_staff_params))
                .done(function (data) {
                    DATA.dunanInfo.perNum = data.length
                    $(".data_per_num").html(DATA.dunanInfo.perNum+' 人')
                    $('#staffUl').empty()
                    var _result = data;
                    console.log(data)  
                    var htmlStr = []
                    _result.forEach(function(item){
                       htmlStr.push('<li>'+item.name+'</li>')
                    })
                    $('#staffUl').append(htmlStr.join(''))
                    if (_result.length === 0) {
                        DATA.staffs.all = [];
                        return;
                    }
                    DATA.staffs.all = _result;
                    DOM.rightMenu.staffs.update();
                })
                .fail(function (xhr) {
                    console.log(JSON.stringify(xhr));
                });
            //DOM.rightMenu.staffs.update();  
            $(".staff-info-model-edit").fadeOut()

        })
    })
    $(".staff-info-model-edit .close-info-btn").click(function(e){  
        $(".staff-info-model-edit").fadeOut()
    })
    $(".task-edit").click(function(){
        $(".J_carTaskItem > div").fadeIn()
    })
    //接警
    $(".alarm-modal-btn").click(function(e){
        var id = $(this).parent().attr("data-id"),
            toUId = "",
            toUName = "";

        _.forEach(DATA.alarmMQ.data, function(item, index){
            if(item._id === id){
                if (_.eq(item.type, 0)) {
                    toUId = item.userInfo._id;
                    toUName = item.userInfo.idcard.name;
                } else if (_.eq(item.type, 3)) {
                    toUId = item.content.imei;
                    toUName = item.content.deviceName;
                }
            }
        });

        // 将报警状态及操作记录写入库
        DATA.alarmMQ.updateRecords({
            _id: id,
            status:1,
            records:[{
                // _id: ,
                uid: DATA.userInfo.uid,
                uname: DATA.userInfo.uname,
                toUid: toUId,
                toUname: toUName,
                content: "接警",
                time: dayjs().valueOf(),
                type: "operations"      // chat || operations
            }]});

        // 修改数据属性status, 其默认为0,表示报警消息, 1表示已接警, 2表示结案
        _.forEach(DATA.alarmMQ.data, function(item, index) {
            if (item._id === id) {
                item.status = 1;

                DOM.rightMenu.alarm.received.update();
                DOM.rightMenu.alarm.processing.update();

                return;
            }
        });
    })
    



    //网点编辑
        //网点添加
    $(".wangdian-add").click(function(){
        $(".wd-add-model").fadeIn()
    })
    //网点删除
    $("#carTaskWD").on('click','.wd-del-btn',function(e){
        var that = $(this)
        var del_data_id = $(this).parent('li').attr('data-id2')
        var lines = JSON.parse($('#carTaskWD').attr('data-lines')) 
        for(var i in lines){
            var row = lines[i]
            if(row._id == del_data_id){
                lines.splice(i,1)
            }
        }
        var updateParams = {lines:lines}; 
        var update_alarm_params = {
            filter: {_id: $(this).parent('li').attr('data-id')}, 
            update: {
                "$set":updateParams  
            }
        }
        $.when(request.Post("common/updateOne/task", update_alarm_params)) 
        .done(function (data) {   
            console.log(data) 
            DATA.escortVehicles.loadTaskInfo(add_task_id.toString());  
            $(".wd-add-model").fadeOut() 
        } )
    })
    $(".add-close").click(function(){
        $(".wd-add-model").fadeOut()
    })
    $(".add-submit").click(function(e){
        var select_data = JSON.parse($("#wd-add-list").val())
        select_data.behavior = $("#behavior-list").val()
        //alert(select_data)
        e.stopPropagation()
        var lines = JSON.parse($('#carTaskWD').attr('data-lines')) 
        var that = $(this) 
        var thisdom = $('#carTaskWD li').eq(0) 
        lines.push(select_data)

        var updateParams = {lines:lines}; 
        var update_alarm_params = {
            filter: {_id: thisdom.attr('data-id')}, 
            update: {
                "$set":updateParams  
            }
        }
        $.when(request.Post("common/updateOne/task", update_alarm_params)) 
        .done(function (data) {   
            console.log(data) 
            DATA.escortVehicles.loadTaskInfo(add_task_id.toString());  
            $(".wd-add-model").fadeOut() 
        } )

        
    })
    $(".wangdian-edit").click(function(){
        $("#carTaskWD li").addClass('edit').children('input').removeAttr('readonly')
    })
    $("#carTaskWD").on('click','.wd-close-btn',function(e){//关闭网点条目
        e.stopPropagation()
        var oldval1 = $(this).parent().siblings('.sname').attr('name')
        var oldval2 = $(this).parent().siblings('.behavior').attr('name')
        $(this).parent().siblings('.sname').val(oldval1)
        $(this).parent().siblings('.behavior').val(oldval2)
        $(this).parents('li').removeClass('edit') 
    })
    $("#carTaskWD").on('click','.wd-submit-btn',function(e){//确认网点条目
        e.stopPropagation()
        var lines = JSON.parse($(this).parents('#carTaskWD').attr('data-lines')) 
        var that = $(this) 
        var thisdom = $(this).parents('li')
        var lines_id = thisdom.attr('data-id2')  
        var oldval1 = $(this).parent().siblings('.sname').val()
        var oldval2 = $(this).parent().siblings('.behavior').val()
        $(this).parent().siblings('.sname').attr('name',oldval1)
        $(this).parent().siblings('.behavior').attr('name',oldval2)
        for(var i in lines){
            var row = lines[i]
            if(row._id==lines_id){
                row.sname = $(this).parent().siblings('.sname').val(),
                row.behavior = $(this).parent().siblings('.behavior').val()
            }
        }
        console.log(lines)
        var updateParams = {lines:lines}; 
        var update_alarm_params = {
            filter: {_id: thisdom.attr('data-id')}, 
            update: {
                "$set":updateParams  
            }
        }
        $.when(request.Post("common/updateOne/task", update_alarm_params)) 
        .done(function (data) {  
            //console.log(data)    
            that.parents('li').removeClass('edit')  
        } )
    })
    
    $(".block4_23").on('click','.task-close-btn',function(e){//关闭task条目
        e.stopPropagation()
        $(this).parent('div').fadeOut() 
    })
    $(".block4_23").on('click','.task-submit-btn',function(e){//编辑task条目
        e.stopPropagation()
        var that = $(this)
        var Caption = $(this).siblings('.task-value1').val(),
            EmuName = $(this).siblings('.task-value2').val(),
            TaskType= $(this).siblings('.task-value3').val(),
            _id = $(this).parents('.J_carTaskItem').attr('data-id')
        var updateParams = {
            Caption:$(this).siblings('.task-value1').val(),
            EmuName:$(this).siblings('.task-value2').val(), 
            TaskType:$(this).siblings('.task-value3').val()  
        };
        var update_alarm_params = {
            filter: {_id: $(this).parents('.J_carTaskItem').attr('data-id')}, 
            update: {
                "$set":updateParams  
            }
        }
        $.when(request.Post("common/updateOne/task", update_alarm_params)) 
        .done(function (data) { 
            console.log(data)   
            that.parents('.J_carTaskItem').html(Caption+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+EmuName+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+TaskType+'<div><input class="task-value1" value="'+Caption+'"/><input class="task-value2" value="'+EmuName+'"/><input class="task-value3" value="'+TaskType+'"/><span class="task-close-btn">取消</span> <span class="task-submit-btn">确认</span></div>')
            that.parent('div').fadeOut() 
        } )

        
    })
    
    // $.contextMenu({
    //     selector: '#staffUl', 
    //     callback: function(key, options) {
    //         var m = "clicked: " + key;
    //         window.console && console.log(m) || alert(m); 
    //     },
    //     items: {
    //         "edit": {name: "Edit", icon: "edit"},
    //         "cut": {name: "Cut", icon: "cut"},
    //        copy: {name: "Copy", icon: "copy"},
    //         "paste": {name: "Paste", icon: "paste"},
    //         "delete": {name: "Delete", icon: "delete"},
    //         "sep1": "---------",
    //         "quit": {name: "Quit", icon: function(){
    //             return 'context-menu-icon context-menu-icon-quit';
    //         }}
    //     }
    // })
    //获取网点信息
    // var update_alarm_params = {
    //     filter: {type: '网点',struct_id:'598bf0c5ed5e690abc6f1357',StateType:'有效'},
    // }
    // $.when(request.Post("common/find/struct", update_alarm_params))  
    $("li.staff-item").contextMenu({  
        width: 110, // width
        itemHeight: 30, // 菜单项height
        bgColor: "#333", // 背景颜色
        color: "#fff", // 字体颜色
        fontSize: 12, // 字体大小 
        hoverBgColor: "#99CC66", // hover背景颜色
        target: function(ele) { // 当前元素
            console.log(ele);
        },
        menu: [{ // 菜单项 
                text: "新增",
                // icon: "img/add.png",
                callback: function() {
                    alert("新增");
                }
            },
            {
                text: "复制",
                // icon: "img/copy.png",
                callback: function() {
                    alert("复制");
                }
            },
            {
                text: "粘贴",
                // icon: "img/paste.png",
                callback: function() {
                    alert("粘贴");
                }
            },
            {
                text: "删除",
                // icon: "img/del.png",
                callback: function() {
                    alert("删除");
                }
            }
        ]

    });   
    $(".close-info-btn").click(function(){
        $(".staff-info-model").fadeOut()
    })
    $(".close-alarm-modal").click(function(){//关闭报警弹窗
        $(".alarm-modal").fadeOut()
    })

    //地图点击添加点
    // BDMap_map.addEventListener("click",function(e){
    //     var marker = new BMap.Marker(new BMap.Point(e.point.lng, e.point.lat)); // 创建点 
    //     BDMap_map.addOverlay(marker); 
	// 	// alert(e.point.lng + "," + e.point.lat);
	// });

});
