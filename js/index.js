const districtListQueryUrl = '/bigscreen/getdistricts',                                         //区县列表查询路由
    officeDeviceListQueryUrl = '/bigscreen/getfixedmaplist',                                    //设备（固定点位）列表查询路由
    nationDeviceListQueryUrl = '/bigscreen/getgkmaplist',                                       //设备（国控点位）列表查询路由
    weatherDataQueryUrl = '/bigscreen/getweather',                                              //天气数据查询路由
    districtDustAvgsForHourDataQueryUrl = '/bigscreen/getdistrictdustavgs',                     //区域扬尘时均值查询路由
    // hzStaticGeoDataQueryUrl = '/api/getjsondata?p=/largeScreen/hangzhou_geojson_full.json',          //杭州地理区划坐标集查询路由
    hmSiteGeoDataQueryUrl = '/api/getjsondata?p=/largeScreen/haimen_geojson.json',          //杭州地理区划坐标集查询路由
    recentData_CityDustQueryUrl = '/bigscreen/getcitydustavgs',                                 //全市扬尘近期趋势数据查询路由
    recentData_DistrictDustQueryUrl = '/bigscreen/getdistrictdustpreavgs',                      //区县扬尘近期趋势数据查询路由
    dustRank_BestDeviceListQueryUrl = '/bigscreen/getbestprojectranklist',                      //扬尘控制排行最好站点列表查询路由
    dustRank_WorstDeviceListQueryUrl = '/bigscreen/getworstprojectranklist',                    //扬尘控制排行最差站点列表查询路由
    deviceFixedDetail_RealtimeDataQueryUrl = '/bigscreen/getrealdata',                          //固定点位设备详情实时数据查询路由
    deviceFixedDetail_RecentDataQueryUrl = '/bigscreen/getlocaldayhistorydata',                 //固定点位设备详情近期趋势数据查询路由
    deviceNationDetail_RealtimeDataQueryUrl = '/bigscreen/getgkrealdata',                       //国控点位设备详情实时数据查询路由
    deviceNationDetail_RecentDataQueryUrl = '/bigscreen/getgklocaldayhistorydata',              //国控点位设备详情近期趋势数据查询路由
    deviceVideoAddressQueryUrl = '/bigscreen/getvideoplayurl',                                  //设备直播链接地址查询路由
    deviceVideoDirectionControlUrl = '/bigscreen/cradlecontrol',                                //设备云台方向控制路由
    deviceVideoCaptureControlUrl = '/bigscreen/capture',                                        //设备云台抓拍路由
    deviceVideoAutoCaptureControlUrl = '/bigscreen/autocapture';                                //设备云台自动抓拍路由


const CITY_NAME = "杭州市",
    HANGZHOUSHI_DISTRACT_ID = '0',      //杭州市数据库区域编号
    COORDINATE = {
        lat: 30.284309,
        lan: 120.181768
    };
const DEVICE_STATUS = {                   //设备状态
    online: {
        status: 1,
        title: "优良",
        color: "#1EFF00",
        key: 'onlineCount'
    },
    warning: {
        status: 2,
        title: "预警",
        color: "#FFD800",
        key: 'warningCount'
    },
    overStandard: {
        status: 3,
        title: "超标",
        color: "#FE3116",
        key: 'overStandardCount'
    },
    offline: {
        status: 4,
        title: "断线",
        color: "#BBBBBB",
        key: 'offlineCount'
    }
};
const RECENT_DUST_TYPE = {              //扬尘趋势类型
    CITY: 1,                            // - 全市
    DISTRICT: 2                         // - 区县
};
const DUST_RANK_TYPE = {                //扬尘控制排行
    BEST: 1,                            // - 最好
    WORST: 2                            // - 最差
};
const DEVICE_DETAIL_PANEL = {           //设备详情面板展示切换开关
    SWITCH_REAL_DATA: 1,                // - 实时数据
    SWITCH_RECENT_DATA: 2               // - 数据曲线
};

let deviceFixedMarkerList = {},           //地图固定点位列表
    deviceNationMarkerList = {};          //地图国控点位列表
let deviceCrossFixedMarkerList = {};      //地图固定点位列表 - 筛选过后的 
let boundaryOverlays = [];                //区划边界覆盖物
let districtComboData = {                       //区县列表下拉选项数据
    currentSelectDistrictId: '',                // - 当前选中的区县编号
    list: []                                    // - 当前区县列表
};

let hzGeoData = {};                             //杭州地理区划坐标点集
let infoBox_DeviceMarker = null,                //标注点窗口
    lastOpenDeviceInfobox_Id = null;            //最后一个打开的点位窗口编号
let deviceRecentData_LineChart = null,          //点位弹窗数据曲线表实例
    cityDustData_LineChart = null,              //全市扬尘趋势曲线表实例
    districtDustData_BarChart = null;           //各区县扬尘趋势柱状图实例

let devicePointType = {                 //设备点类型列表
    points_Fixed: {                     //  - 固定点位
        key: 1,                         //      - 点位唯一标识
        show: true                      //      - 点位状态
    },
    points_move: {                      //  - 移动点位
        key: 2,
        show: false
    },
    points_nation: {                    //  - 国控点位
        key: 3,
        show: false
    },
    popShow: [true, false]              //  - 点位小标题弹窗开关 [设备标题显示，设备检测值显示]
};

let worldTime = {                       //世界时间
    y: new Date().getFullYear(),
    m: new Date().getMonth() + 1,
    d: new Date().getDate(),
    t: new Date(),
    currentTimeType: 1                //  - 当前时间类型, 对应枚举值： 1【日】、2【月】、3【年】
};
let currentRecentDustType = RECENT_DUST_TYPE.CITY,  //当前选中的趋势类型
    currentRankDustTye = DUST_RANK_TYPE.WORST;      //当前选中的排行类型

let leftHidenPanelTimer = null,        //左侧面板隐藏的计时器
    leftArrowHidenTimer = null,        //左侧面板箭头(右) 隐藏计时器
    leftArrowShowTimer = null,         //左侧面板箭头(left) 隐藏计时器
    rightHidenPanelTimer = null,       //左侧面板隐藏的计时器
    rightArrowHidenTimer = null,       //左侧面板箭头(右) 隐藏计时器
    rightArrowShowTimer = null;        //左侧面板箭头(left) 隐藏计时器
let deviceVideoInstance = null,        //设备视频容器的实例
    deviceVideoAutoCloseTId = null;    //设备视频自动关闭计时器
const VIDEO_PLAY_COUNTDOWN = 5 * 60;   //视频播放倒计时，单位： 秒(s)


let deviceDetailTId = null,               //设备详情计时器实例
    deviceListTId = null,                 //设备列表轮询计时器实例
    dustRecentDataTId = null,             //扬尘趋势数据刷新计时器实例
    dustRankDataTId = null;               //扬尘排行数据刷新计时器实例

let deviceFixedListQueryTId = null,         //固定点位列表查询计时器实例
    deviceNationListQueryTId = null,        //国控点位列表查询计时器实例
    deviceMovedListQueryTId = null,         //移动监测点位列表查询计时器实例
    weatherDataQueryTId = null,             //天气数据查询计时器实例
    districtDustAvgsHDTId = null;           //区县扬尘小时均值计时器实例

const TIMER_TYPE = {                        //计时器类型
    T_HOUR: 1,                              //  - 按小时整点
    T_QUATTER_HOUR: 2,                      //  - 每15分钟
    T_SECOND_MIN_IN_HOUR: 3                 //  - 按小时整点后延时两分钟
};

const REPLAYBACK_CONTROLS = {               //历史数据追溯功能类型
    STOP: 1,                                //  - 暂停
    PLAY: 2,                                //  - 播放
    JUMP: 3,                                //  - 跳跃倒指定时刻
    SPEED: 4                                //  - 播放速率
};
let playBackOptions = {
    switch: false,                          //追溯开关，默认：关闭
    countDown: 5 * 1000,                    //追溯时间倒计时间隔
    queryTId: null,                         //时间追溯计时器
    currentHourLine: [],
    currentHour: ''
};

let recentCityDustPopResetQueryTId = null;   //全市扬尘趋势曲线重置查询计时器
let hiddenLegend = [],                       //隐藏的设备状态
    deviceStateStatistic = {};               //设备对应状态数量统计

/**
 * 获取区县列表
 */
function getDistrictData() {
    handleCommonAjaxRequest(districtListQueryUrl, 'GET', {}, function (res, err) {
        if (err) return;

        if (res && res.length > 0) {
            let comboData = [{ id: HANGZHOUSHI_DISTRACT_ID, districtName: "全市" }].concat(res),
                districtId = comboData[0].id;

            //初始化默认值
            $('#district_select_panel .dp-select span').text(comboData[0].districtName);
            $('#district_select_panel .dp-select span').attr('data-districtId', districtId);

            //列表数据绑定
            if (comboData.length >= 0) {
                comboData.map(function (item, index) {
                    if (index === 0) {
                        $('#district_select_panel ul').append('<li class="dp-list" style="background: #28D5E4;" data-districtId="' + item.id + '">' + item.districtName + '</li>');
                    } else {
                        $('#district_select_panel ul').append('<li class="dp-list" data-districtId="' + item.id + '">' + item.districtName + '</li>');
                    }
                    return true;
                });
            }

            //初始化触发项变更
            districtIdOnChange(districtId, comboData[0].districtName, true);

            //存储区县列表
            districtComboData.list = comboData;
            districtComboData.currentSelectDistrictId = districtId;
        }
    });
}

/**
 * 区县下拉列表项变更事件
 * @param {Number} districtId - 区县编号
 * @param {Boolean} [districtName] - 区县名称
 */
function districtIdOnChange(districtId, districtName, needResetView) {
    let districtData = {
        city: CITY_NAME,
        area: districtId === HANGZHOUSHI_DISTRACT_ID ? '' : districtName
    };

    //区县变更关联数据的查询
    createDataRelatedToDistrictQueryTimer(districtId, districtData, !!needResetView);
}

/**
 * 创建区县变更关联数据的查询的定时器
 * @param {String} districtId 
 * @param {Object} districtData 当前区县信息
 * @param {Boolean} needResetView 是否需要重新调整视野
 */
function createDataRelatedToDistrictQueryTimer(districtId, districtData, needResetView) {
    //地图覆盖物： 边界、点位（固定点位、移动监测点位、国控点位）
    //  -> 绘制区域边界
    drawBoundary(districtId, districtData, needResetView);
    //  -> 绘制固定点位，变更设备状态图例
    drawDeviceFixedMarker(districtId, needResetView);
    //  -> 绘制移动点位，变更设备状态图例
    // drawDeviceMoveMarker(districtId, needResetView);
    //  -> 绘制国国控位，变更设备状态图例
    // drawDeviceNationMarker(districtId, needResetView);

    //气象数据
    getWeatherData();

    //区域扬尘浓度
    getDistrictDustAvgsForHourData();

    //销毁计时器
    clearInterval(deviceFixedListQueryTId);
    clearInterval(deviceNationListQueryTId);
    clearInterval(deviceMovedListQueryTId);
    clearInterval(weatherDataQueryTId);
    clearInterval(districtDustAvgsHDTId);

    //创建计时器
    let extraParams = [districtId, false];
    timeObserver(TIMER_TYPE.T_QUATTER_HOUR, deviceFixedListQueryTId, drawDeviceFixedMarker, extraParams);
    // timeObserver(TIMER_TYPE.T_HOUR, deviceNationListQueryTId, drawDeviceMoveMarker, extraParams);
    // timeObserver(TIMER_TYPE.T_HOUR, deviceMovedListQueryTId, drawDeviceNationMarker, extraParams);
    timeObserver(TIMER_TYPE.T_HOUR, weatherDataQueryTId, getWeatherData);
    timeObserver(TIMER_TYPE.T_SECOND_MIN_IN_HOUR, districtDustAvgsHDTId, getDistrictDustAvgsForHourData);
}

/**
 * 绘制区域边界
 * @param {String} districtId 区域编号
 * @param {Object} districtData - 行政区划信息 {city: "", area: ""}
 * @param {Boolean} needResetView 是否需要重新调整视野
 */
function drawBoundary(districtId, districtData, needResetView) {
    //1、需调整视野前 -> 移除区划边界覆盖物
    if (needResetView) {
        let boundaryOverlaysLength = boundaryOverlays.length;
        for (let i = 0; i < boundaryOverlaysLength; i++) {
            map.removeOverlay(boundaryOverlays[i]);
        }
    }

    //2、依据区划重新调整视野且添加覆盖物
    if (districtId === HANGZHOUSHI_DISTRACT_ID) {
        //修正视野
        if (needResetView) {
            map.centerAndZoom(new BMap.Point(COORDINATE.lan, COORDINATE.lat), currentMapZoom);
        }
    } else {
        if (needResetView) {
            getBoundary(districtData, function (boundaries) {
                if (boundaries && boundaries.length === 0) {
                    let point = null;
                    if (districtId === 14) {
                        point = new BMap.Point(120.483088, 30.314181);
                    } else if (districtId === 15) {
                        point = new BMap.Point(120.12317, 30.228673);
                    }
                    if (point) {
                        map.panTo(point);
                    }
                    return;
                }

                boundaryOverlays.length = 0;
                let pointArray = [];
                for (let i = 0; i < boundaries.length; i++) {
                    //建立多边形覆盖物
                    let polygon = new BMap.Polygon(boundaries[i], {
                        strokeWeight: 2,
                        strokeColor: "#1eff00",
                        fillColor: "",
                        strokeStyle: 'dashed'
                    });
                    map.addOverlay(polygon);                //添加覆盖物
                    pointArray = pointArray.concat(polygon.getPath());
                    boundaryOverlays.push(polygon);
                }

                if (needResetView) {
                    map.setViewport(pointArray);    //调整视野，地理区域或坐标
                }
            });
        }
    }
}

/**
 * 获取行政区域的边界点集
 * @param {Object} districtData - 行政区划 {city: "", area: ""}
 * @param {Object} callback - 回调函数
 */
function getBoundary(districtData, callback) {
    let name = districtData.city + districtData.area;
    let boundary = new BMap.Boundary();
    boundary.get(name, function (rs) {
        if (rs.boundaries && rs.boundaries.length > 0) {
            callback(rs.boundaries);
            return;
        } else {
            if (districtData.city && districtData.city.length > 0) {
                districtData.city = '';
                getBoundary(districtData, callback);
                return;
            } else {
                callback([]);
                return;
            }
        }
    });
}

/**
 * 绘制设备标注，变更设备状态图例
 * @param {String} districtId 区域编号
 * @param {Boolean} needResetView - 是否切换区划
 */
function drawDeviceFixedMarker(districtId, needResetView, t) {
    let reqParams = {
        t: t || getFormatDateNew('b').toString().slice(0, 10),
        districtId: districtId
    }

    deviceCrossFixedMarkerList = {};
    if (needResetView) {
        //清空固定点位
        Object.values(deviceFixedMarkerList).map(function (item) {
            map.removeOverlay(item.marker);
            item.infobox.close();
            item.infobox_dust.close();
            return true;
        });

        deviceFixedMarkerList = {};                                    //重置地图固定点位列表

        // ——> 区划下设备详情
        handleCommonAjaxRequest(officeDeviceListQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            let rLen = res.length;
            //优良、报警、超标、断线
            let onlineCount = 0, warningCount = 0, overStandardCount = 0, offlineCount = 0;

            if (res && rLen > 0) {
                //初始化所有标注点
                for (let i = 0; i < rLen; i++) {
                    //设备标注点存储
                    deviceFixedMarkerList[res[i].devicePoleId] = res[i];

                    switch (res[i].status) {
                        case DEVICE_STATUS.online.status:
                            onlineCount += 1;
                            break;
                        case DEVICE_STATUS.warning.status:
                            warningCount += 1;
                            break;
                        case DEVICE_STATUS.overStandard.status:
                            overStandardCount += 1;
                            break;
                        default:
                            offlineCount += 1;
                            break;
                    }
                }

                Object.values(deviceFixedMarkerList).map(function (device) {
                    //创建标注点
                    if (device.devicePoleId !== void 0 && device.longitude !== void 0 && device.latitude !== void 0) {
                        let marker = setDeviceFixedMarkerInfo(device),
                            infobox = setDeviceFixedInfobox(device),
                            infobox_dust = setDeviceFixedInfobox_Dust(device);

                        deviceFixedMarkerList[device.devicePoleId].marker = marker;
                        deviceFixedMarkerList[device.devicePoleId].infobox = infobox;
                        deviceFixedMarkerList[device.devicePoleId].infobox_dust = infobox_dust;
                    }
                });

                deviceMarkerFilter();
            }

            deviceStateStatistic = {
                onlineCount: onlineCount,
                warningCount: warningCount,
                overStandardCount: overStandardCount,
                offlineCount: offlineCount
            };
            renderDeviceStatusStatistic_PieChart();
        });
    } else {
        //获取区县下设备列表
        handleCommonAjaxRequest(officeDeviceListQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            let rLen = res.length;
            //优良、报警、超标、断线、异常
            let onlineCount = 0, warningCount = 0, overStandardCount = 0, offlineCount = 0;

            if (res && rLen >= 0) {
                if (Object.keys(deviceFixedMarkerList).length === 0) {
                    //初始化 填充所有标注点
                    for (let i = 0; i < rLen; i++) {
                        deviceFixedMarkerList[res[i].devicePoleId] = res[i];
                    }

                    Object.values(deviceFixedMarkerList).map(function (device) {
                        //创建标注点
                        if (device.devicePoleId !== void 0 && device.longitude !== void 0 && device.latitude !== void 0) {
                            let marker = setDeviceFixedMarkerInfo(device),
                                infobox = setDeviceFixedInfobox(device),
                                infobox_dust = setDeviceFixedInfobox_Dust(device);

                            deviceFixedMarkerList[device.devicePoleId].marker = marker;
                            deviceFixedMarkerList[device.devicePoleId].infobox = infobox;
                            deviceFixedMarkerList[device.devicePoleId].infobox_dust = infobox_dust;
                        }
                    });
                } else {
                    //计时器刷新 更新标注点
                    let removeList = diffFixedDeviceToRemoveList(res),
                        addList = diffFixedDeviceToAddList(res);

                    removeList.map(function (device) {
                        map.removeOverlay(device.marker);
                        device.infobox.close();
                        device.infobox_dust.close();
                        return true;
                    });

                    Object.values(addList).map(function (device) {
                        //创建标注点
                        if (device.devicePoleId !== void 0 && device.longitude !== void 0 && device.latitude !== void 0) {
                            let marker = setDeviceFixedMarkerInfo(device),
                                infobox = setDeviceFixedInfobox(device),
                                infobox_dust = setDeviceFixedInfobox_Dust(device);

                            deviceFixedMarkerList[device.devicePoleId].marker = marker;
                            deviceFixedMarkerList[device.devicePoleId].infobox = infobox;
                            deviceFixedMarkerList[device.devicePoleId].infobox_dust = infobox_dust;
                        }
                    });
                }

                deviceMarkerFilter();

                res.map(function (device, index) {
                    //变更设备状态图例
                    switch (device.status) {
                        case 1:
                            onlineCount += 1;
                            break;
                        case 2:
                            warningCount += 1;
                            break;
                        case 3:
                            overStandardCount += 1;
                            break;
                        default:
                            offlineCount += 1;
                            break;
                    }
                });
            }

            deviceStateStatistic = {
                onlineCount: onlineCount,
                warningCount: warningCount,
                overStandardCount: overStandardCount,
                offlineCount: offlineCount
            };
            renderDeviceStatusStatistic_PieChart();
        });
    }
}

/**
 * 绘制移动设备标注，变更设备状态图例
 * @param {String} districtId 区域编号
 * @param {Boolean} needResetView - 是否切换区划
 */
function drawDeviceMoveMarker(_districtId, _needResetView) {
    //
}

/**
 * 绘制国控设备标注，变更设备状态图例
 * @param {String} districtId 区域编号
 * @param {Boolean} needResetView - 是否切换区划
 */
function drawDeviceNationMarker(districtId, needResetView) {
    let reqParams = {
        t: getFormatDateNew('b').toString().slice(0, 10),
        districtId: districtId
    }
    if (needResetView) {
        //清空固定点位
        Object.values(deviceNationMarkerList).map(function (item) {
            map.removeOverlay(item.marker);
            item.infobox.close();
            item.infobox_aqi.close();
            return true;
        });

        deviceNationMarkerList = {};                                    //重置地图国控点位列表

        handleCommonAjaxRequest(nationDeviceListQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            let rLen = res.length;
            if (res && rLen > 0) {
                //初始化所有标注点
                for (let i = 0; i < rLen; i++) {
                    //设备标注点存储
                    deviceNationMarkerList[res[i].projectId] = res[i];
                }

                Object.values(deviceNationMarkerList).map(function (device) {
                    //创建标注点
                    if (device.projectId !== void 0 && device.longitude !== void 0 && device.latitude !== void 0) {
                        let marker = setDeviceNationMarkerInfo(device),
                            infobox = setDeviceNationInfobox(device),
                            infobox_aqi = setDeviceNationInfobox_AQI(device);

                        deviceNationMarkerList[device.projectId].marker = marker;
                        deviceNationMarkerList[device.projectId].infobox = infobox;
                        deviceNationMarkerList[device.projectId].infobox_aqi = infobox_aqi;
                        if (BMapLib.GeoUtils.isPointInRect(device.marker.point, map.getBounds()) && devicePointType.points_nation.show) {
                            map.addOverlay(marker);
                        }
                    }
                });
            }
        });
    } else {
        handleCommonAjaxRequest(nationDeviceListQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            let rLen = res.length;

            if (res && rLen >= 0) {
                if (Object.keys(deviceNationMarkerList).length === 0) {
                    //初始化 填充所有标注点
                    for (let i = 0; i < rLen; i++) {
                        deviceNationMarkerList[res[i].projectId] = res[i];
                    }

                    Object.values(deviceNationMarkerList).map(function (device) {
                        //创建标注点
                        if (device.projectId !== void 0 && device.longitude !== void 0 && device.latitude !== void 0) {
                            let marker = setDeviceNationMarkerInfo(device),
                                infobox = setDeviceNationInfobox(device),
                                infobox_aqi = setDeviceNationInfobox_AQI(device);

                            deviceNationMarkerList[device.projectId].marker = marker;
                            deviceNationMarkerList[device.projectId].infobox = infobox;
                            deviceNationMarkerList[device.projectId].infobox_aqi = infobox_aqi;
                            if (BMapLib.GeoUtils.isPointInRect(device.marker.point, map.getBounds()) && devicePointType.points_nation.show) {
                                map.addOverlay(marker);
                            }
                        }
                    });
                } else {
                    //计时器刷新 更新标注点
                    let removeList = diffNationDeviceToRemoveList(res),
                        addList = diffNationDeviceToAddList(res);

                    removeList.map(function (device) {
                        map.removeOverlay(device.marker);
                        device.infobox.close();
                        device.infobox_aqi.close();
                        return true;
                    });

                    Object.values(addList).map(function (device) {
                        //创建标注点
                        if (device.projectId !== void 0 && device.longitude !== void 0 && device.latitude !== void 0) {
                            let marker = setDeviceNationMarkerInfo(device),
                                infobox = setDeviceNationInfobox(device),
                                infobox_aqi = setDeviceNationInfobox_AQI(device);

                            deviceNationMarkerList[device.projectId].marker = marker;
                            deviceNationMarkerList[device.projectId].infobox = infobox;
                            deviceNationMarkerList[device.projectId].infobox_aqi = infobox_aqi;

                            if (BMapLib.GeoUtils.isPointInRect(device.marker.point, map.getBounds()) && devicePointType.points_nation.show) {
                                map.addOverlay(marker);
                            }
                        }
                    });
                }
            }
        });
    }
}

/**
 * 过滤出需要移除的固定设备 - 不存该改区划的设备、需要变更信息（设备状态，经、纬坐标）的设备
 * @param {Array} deviceList - 当前区县的固定设备列表
 * @return {Array} removeList - 要移除的固定设备列表 [{deiveData1}, ..., {deiveDatan}]
 */
function diffFixedDeviceToRemoveList(deviceList) {
    let removeList = [];
    Object.values(deviceFixedMarkerList).map(function (device) {
        let existD = deviceList.filter(function (_device) {
            return device.devicePoleId === _device.devicePoleId;
        });

        if (existD.length === 0) {
            removeList.push(device);
            delete deviceFixedMarkerList[device.devicePoleId];
        } else {
            if (existD[0].status !== device.status || existD[0].longitude !== device.longitude || existD[0].latitude !== device.latitude) {
                removeList.push(device);
            }
        }
    });
    return removeList;
}

/**
 * 过滤出需要添加的固定设备 - 存在该区划但未显示的设备、需要变更信息（设备状态，经、纬坐标）的设备
 * @param {Array} deviceList - 当前区县的固定设备列表
 * @return {Object} addList - 要追加的固定设备列表 {"devicePoleId1": {deiveData1}, ..., "devicePoleIdn": {deiveDatan}}
 */
function diffFixedDeviceToAddList(deviceList) {
    let addList = {};
    deviceList.map(function (device) {
        let existD = Object.values(deviceFixedMarkerList).filter(function (_device) {
            return device.devicePoleId === _device.devicePoleId;
        });

        if (existD.length === 0) {
            addList[device.devicePoleId] = device;

            //同步到设备标注列表内
            deviceFixedMarkerList[device.devicePoleId] = device;
        } else {
            if (existD[0].status !== device.status || existD[0].longitude !== device.longitude || existD[0].latitude !== device.latitude) {
                addList[device.devicePoleId] = deviceFixedMarkerList[device.devicePoleId];
                if (existD[0].status !== device.status) {
                    addList[device.devicePoleId].status = device.status;
                    deviceFixedMarkerList[device.devicePoleId].status = device.status;
                }
                if (existD[0].longitude !== device.longitude) {
                    addList[device.devicePoleId].longitude = device.longitude;
                    deviceFixedMarkerList[device.devicePoleId].longitude = device.longitude;
                }
                if (existD[0].latitude !== device.latitude) {
                    addList[device.devicePoleId].latitude = device.latitude;
                    deviceFixedMarkerList[device.devicePoleId].latitude = device.latitude;
                }
            }
        }
    });

    return addList;
}

/**
 * 过滤出需要移除的国控设备 - 不存该改区划的设备、需要变更信息（设备状态，经、纬坐标）的设备
 * @param {Array} deviceList - 当前区县的国控设备列表
 * @return {Array} removeList - 要移除的国控设备列表 [{deiveData1}, ..., {deiveDatan}]
 */
function diffNationDeviceToRemoveList(deviceList) {
    let removeList = [];
    Object.values(deviceNationMarkerList).map(function (device) {
        let existD = deviceList.filter(function (_device) {
            return device.projectId === _device.projectId;
        });

        if (existD.length === 0) {
            removeList.push(device);
            delete deviceNationMarkerList[device.projectId];
        } else {
            if (existD[0].aqi !== device.aqi || existD[0].longitude !== device.longitude || existD[0].latitude !== device.latitude) {
                removeList.push(device);
            }
        }
    });
    return removeList;
}

/**
 * 过滤出需要添加的国控设备 - 存在该区划但未显示的设备、需要变更信息（设备状态，经、纬坐标）的设备
 * @param {Array} deviceList - 当前区县的国控设备列表
 * @return {Object} addList - 要追加的国控设备列表 {"projectId1": {deiveData1}, ..., "projectIdn": {deiveDatan}}
 */
function diffNationDeviceToAddList(deviceList) {
    let addList = {};
    deviceList.map(function (device) {
        let existD = Object.values(deviceNationMarkerList).filter(function (_device) {
            return device.projectId === _device.projectId;
        });

        if (existD.length === 0) {
            addList[device.projectId] = device;

            //同步到设备标注列表内
            deviceNationMarkerList[device.projectId] = device;
        } else {
            if (existD[0].aqi !== device.aqi || existD[0].longitude !== device.longitude || existD[0].latitude !== device.latitude) {
                addList[device.projectId] = deviceNationMarkerList[device.projectId];
                if (existD[0].aqi !== device.aqi) {
                    addList[device.projectId].aqi = device.aqi;
                    deviceNationMarkerList[device.projectId].aqi = device.aqi;
                }
                if (existD[0].longitude !== device.longitude) {
                    addList[device.projectId].longitude = device.longitude;
                    deviceNationMarkerList[device.projectId].longitude = device.longitude;
                }
                if (existD[0].latitude !== device.latitude) {
                    addList[device.projectId].latitude = device.latitude;
                    deviceNationMarkerList[device.projectId].latitude = device.latitude;
                }
            }
        }
    });

    return addList;
}

/**
 * 配置固定设备标注点
 * @param {Object} deviceData
 */
function setDeviceFixedMarkerInfo(deviceData) {
    let deviceMarker = new BMap.Marker();
    let point = new BMap.Point(deviceData.longitude, deviceData.latitude);
    deviceMarker.setPosition(point);

    let icon = null,
        iconSize = new BMap.Size(26, 70);

    switch (deviceData.status) {
        case DEVICE_STATUS.online.status:
            icon = new BMap.Icon("/images/marker_online.svg", iconSize);
            break;
        case DEVICE_STATUS.warning.status:
            icon = new BMap.Icon("/images/marker_warning.svg", iconSize);
            break;
        case DEVICE_STATUS.overStandard.status:
            icon = new BMap.Icon("/images/marker_overstandard.svg", iconSize);
            break;
        default:
            icon = new BMap.Icon("/images/marker_offline.svg", iconSize);
            break;
    }

    deviceMarker.setIcon(icon);
    deviceMarker.setShadow(icon);
    deviceMarker.setTitle(deviceData.projectName + '【' + deviceData.mnCode.slice(-4) + '】');
    deviceMarker.addEventListener("click", function (e) {
        if (infoBox_DeviceMarker) {
            infoBox_DeviceMarker.close();
            infoBox_DeviceMarker = null;
        }

        //固定点位信息窗口展示
        fixedMarkerDescWindowsShow(deviceData, e.target);
    });
    return deviceMarker;
}

// /**
//  * 配置国控设备标注点
//  * @param {Object} deviceData
//  */
// function setDeviceNationMarkerInfo(deviceData) {
//     let deviceMarker = new BMap.Marker();
//     let point = new BMap.Point(deviceData.longitude, deviceData.latitude);
//     deviceMarker.setPosition(point);

//     let colorCode = weatherAQIColorMatch(deviceData.aqi).slice(1);
//     let icon = new BMap.Icon("/static/public/image/marker_status_icon/z/" + colorCode + ".svg", new BMap.Size(70, 54));

//     deviceMarker.setIcon(icon);
//     deviceMarker.setShadow(icon);
//     deviceMarker.setTitle(deviceData.projectName + '【' + deviceData.projectId + '】');
//     deviceMarker.addEventListener("click", function (e) {
//         if (infoBox_DeviceMarker) {
//             infoBox_DeviceMarker.close();
//             infoBox_DeviceMarker = null;
//         }
//         nationMarkerDescWindowsShow(deviceData, e.target);
//     });
//     return deviceMarker;
// }

/**
 * 配置固定点位设备二级小弹窗 - 展示点位设备名称1
 * @param {Object} deviceData - 设备信息
 * 
 */


function setDeviceFixedInfobox(deviceData) {
    let sContent = '<div class="infoaa" id="infoaa_' + deviceData.devicePoleId + '">'+ 
        '<div class="infoaa_l"></div>'+
        ' <div class="infoaa_c">'+ (deviceData.projectName || "-") +'</div>'+
        '<div class="infoaa_r"></div>'+
    '</div>';

    let infobox = new BMapLib.InfoBox(map, sContent, {
        boxStyle: {
            width: "134",
            Height: "25"
        },
        closeIconMargin: "0",
        closeIconUrl: '/images/kongbai.png',
        enableAutoPan: false,
        align: INFOBOX_AT_TOP,
        offset: new BMap.Size(0, 30)
    });

    let point = new BMap.Point(deviceData.longitude, deviceData.latitude);
    infobox.open(point);
    infobox.hide();

    $("#infoaa_" + deviceData.devicePoleId).on('click', function () {
        if (infoBox_DeviceMarker) {
            infoBox_DeviceMarker.close();
            infoBox_DeviceMarker = null;
        }

        //固定点位信息窗口展示
        fixedMarkerDescWindowsShow(deviceData, deviceData.marker);
    })

    return infobox;
}



/**
 * 配置点位固定点位设备二级小弹窗 - 展示扬尘值
 * @param {Object} deviceData - 设备信息
 */
function setDeviceFixedInfobox_Dust(deviceData) {
    let sContent = '<div class="infoaa" id="infoaa_' + deviceData.devicePoleId + '" style="background: url(' + "/images/info_til.png" + ') no-repeat; cursor: pointer; text-indent:5px; background-size: 100% 100%; text-align: center; width: 50px; opacity: 0.82; font-size: 12px; color: #00C3FF; font-weight: 400;height: 30px; line-height: 25px; position: absolute;top: -36px; left: 0px;">' + toFixed(deviceData.dust, 3) + '</div>';
    let infobox = new BMapLib.InfoBox(map, sContent, {
        boxStyle: {
            width: "134",
            Height: "25"
        },
        closeIconMargin: "0",
        closeIconUrl: '/images/kongbai.png',
        enableAutoPan: false,
        align: INFOBOX_AT_TOP,
        offset: new BMap.Size(0, 30)
    });

    let point = new BMap.Point(deviceData.longitude, deviceData.latitude);
    infobox.open(point);
    infobox.hide();

    $("#infoaa_" + deviceData.devicePoleId).on('click', function () {
        if (infoBox_DeviceMarker) {
            infoBox_DeviceMarker.close();
            infoBox_DeviceMarker = null;
        }

        //固定点位信息窗口展示
        fixedMarkerDescWindowsShow(deviceData, deviceData.marker);
    })

    return infobox;
}

/**
 * 配置点位固定点位设备二级小弹窗 - 展示设备名称
 * @param {Object} deviceData - 设备信息
 */
function setDeviceNationInfobox(deviceData) {
    let l = deviceData.projectName.length * 15;
    let sContent = '<div class="infoaa" id="infoaa_' + deviceData.projectId + '" style="background: url(' + "images/info_til.png" + ') no-repeat; cursor: pointer; text-indent:5px; background-size: 100% 100%; text-align: center; width: ' + l + 'px; opacity: 0.82; font-size: 12px; color: #00C3FF; font-weight: 400;height: 30px; line-height: 25px; position: absolute;top: -36px; left: 0px;">' + deviceData.projectName || '-' + '</div>';
    let infobox = new BMapLib.InfoBox(map, sContent, {
        boxStyle: {
            width: "134",
            Height: "25"
        },
        closeIconMargin: "0",
        closeIconUrl: '/images/kongbai.png',
        enableAutoPan: false,
        align: INFOBOX_AT_TOP,
        offset: new BMap.Size(0, 30)
    });

    let point = new BMap.Point(deviceData.longitude, deviceData.latitude);

    infobox.open(point);
    if (!devicePointType.popShow[0] || !devicePointType.points_nation.show) {
        infobox.hide();
    }

    $("#infoaa_" + deviceData.projectId).on('click', function () {
        if (infoBox_DeviceMarker) {
            infoBox_DeviceMarker.close();
            infoBox_DeviceMarker = null;
        }
        nationMarkerDescWindowsShow(deviceData, deviceData.marker);
    })

    return infobox;
}

/**
 * 配置点位固定点位设备二级小弹窗 - 展示AQI
 * @param {Object} deviceData - 设备信息
 */
function setDeviceNationInfobox_AQI(deviceData) {
    let sContent = '<div class="infoaa" id="infoaa_' + deviceData.projectId + '" style="background: url(' + "/images/info_til.png" + ') no-repeat; cursor: pointer; text-indent:5px; background-size: 100% 100%; text-align: center; width: 30px; opacity: 0.82; font-size: 12px; color: #00C3FF; font-weight: 400;height: 30px; line-height: 25px; position: absolute;top: -36px; left: 0px;">' + deviceData.aqi || '-' + '</div>';
    let infobox = new BMapLib.InfoBox(map, sContent, {
        boxStyle: {
            width: "134",
            Height: "25"
        },
        closeIconMargin: "0",
        closeIconUrl: '/images/kongbai.png',
        enableAutoPan: false,
        align: INFOBOX_AT_TOP,
        offset: new BMap.Size(0, 30)
    });

    let point = new BMap.Point(deviceData.longitude, deviceData.latitude);
    infobox.open(point);
    if (!devicePointType.popShow[1] || !devicePointType.points_nation.show) {
        infobox.hide();
    }

    $("#infoaa_" + deviceData.devicePoleId).on('click', function () {
        if (infoBox_DeviceMarker) {
            infoBox_DeviceMarker.close();
            infoBox_DeviceMarker = null;
        }

        //固定点位信息窗口展示
        fixedMarkerDescWindowsShow(deviceData, deviceData.marker);
    })

    return infobox;
}

/**
 * 打开固定设备标注的描述浮动窗口
 * @param {Object} info 
 * @param {Object} marker 
 */
function fixedMarkerDescWindowsShow(info, marker) {
    //摄像头的状态，对应枚举值 0【没有摄像头装备】、1【视频服务就绪】、2【视频服务关闭】
    let cameraContent = "";
    if (info.cameraStatus) {
        cameraContent = info.cameraStatus === 1 ? '<span class="sp1 iconfont iconshipin" id="videoShowBtn"></span>' : '<span class="sp1 iconfont iconshipin_close"></span>';
    }

    let sContent =
        ' <div class="mskbox_top"></div>' +
        '<div class="mskbox">' +
        '        <div class="des">' +
        '            <h2 class="one-txt-cut">' + info.projectName + '</h2>' +
        '            <p><i class="iconfont icondevice-mncode"></i>设备码：<span>' + info.mnCode + '</span></p >' +
        '            <p><i class="iconfont iconweizhi"></i>监测点位：<span>' + info.projectAddress + '</span></p >' +
        '            <p><i class="iconfont icondevice-polename"></i>灯杆号：<span>' + (info.devicePoleName || '-') + '</span></p >' +
        '            <p><i class="iconfont icondistrictname"></i>所属区县：<span>' + info.districtName + '</span></p >' +
        '        </div>' +
        '        <ul class="tab clearfix">' +
        '            <li class="act" data-index="' + DEVICE_DETAIL_PANEL.SWITCH_REAL_DATA + '"><i class="iconfont iconrealtime-data"></i>实时数据</li>' +
        '            <li data-index="' + DEVICE_DETAIL_PANEL.SWITCH_RECENT_DATA + '"><i class="iconfont iconrecent-data-line"></i>数据曲线</li>' +
        cameraContent +
        '        </ul>' +
        '        <div class="con">' +
        '            <div class="tabcon show">' +
        '                <table id="deviceDetailPanel_' + info.devicePoleId + '">' +
        '                </table>' +
        '            </div>' +
        '            <div class="tabcon">' +
        '               <div id="deviceDetail_LineChart_' + info.devicePoleId + '" style="width:100%;height:143px"></div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        ' <div class="mskbox_bot"></div>'

    infoBox_DeviceMarker = new BMapLib.InfoBox(map, sContent, {
        boxStyle: {
            zIndex: '1000'
        },
        closeIconMargin: "8px 8px 0 0",
        closeIconUrl: "/images/close_info.png",
        enableAutoPan: false,
        align: INFOBOX_AT_TOP,
        offset: new BMap.Size(0, 30)
    });

    let point = new BMap.Point(marker.getPosition().lng, marker.getPosition().lat);
    infoBox_DeviceMarker.addEventListener("open", function (e) {
        fixedMarkerInfoboxOpened(info, e);
    });
    infoBox_DeviceMarker.addEventListener("close", function (e) {
        fixedMarkerInfoboxClosed(info, e);
    });

    map.panTo(point, { noAnimation: false });
    infoBox_DeviceMarker.open(point);
}

// /**
//  * 打开国控设备标注的描述浮动窗口
//  * @param {Object} info 
//  * @param {Object} marker 
//  */
// function nationMarkerDescWindowsShow(info, marker) {
//     let sContent = '<div class="mskbox">' +
//         '        <div style="background: url(\'/static/public/image/largeScreen/dp-down.svg\') no-repeat; background-size: 100%; width: 28px; height: 31px; position: absolute; bottom: 0; left: calc(50% - 18px);"></div>' +
//         '        <div class="des">' +
//         '            <h2 class="one-txt-cut">' + info.projectName + '</h2>' +
//         '            <p><i class="iconfont iconweizhi"></i>监测点位：<span>' + info.projectName + '</span></p >' +
//         '            <p><i class="iconfont icondistrictname"></i>所属区县：<span>' + info.districtName + '</span></p >' +
//         '        </div>' +
//         '        <ul class="tab clearfix">' +
//         '            <li class="act" data-index="' + DEVICE_DETAIL_PANEL.SWITCH_REAL_DATA + '"><i class="iconfont iconrealtime-data"></i>实时数据</li>' +
//         '            <li data-index="' + DEVICE_DETAIL_PANEL.SWITCH_RECENT_DATA + '"><i class="iconfont iconrecent-data-line"></i>数据曲线</li>' +
//         '        </ul>' +
//         '        <div class="con">' +
//         '            <div class="tabcon show">' +
//         '                <table id="deviceDetailPanel_' + info.projectId + '">' +
//         '                </table>' +
//         '            </div>' +
//         '            <div class="tabcon">' +
//         '               <div id="deviceDetail_LineChart_' + info.projectId + '" style="width:100%;height:143px"></div>' +
//         '            </div>' +
//         '        </div>' +
//         '    </div>';

//     infoBox_DeviceMarker = new BMapLib.InfoBox(map, sContent, {
//         boxStyle: {
//             width: "365"
//         },
//         closeIconMargin: "27px -10px 0 0",
//         closeIconUrl: "/static/public/image/largeScreen/close_infobox.svg",
//         enableAutoPan: false,
//         align: INFOBOX_AT_TOP,
//         offset: new BMap.Size(0, 30)
//     });

//     let point = new BMap.Point(marker.getPosition().lng, marker.getPosition().lat);
//     infoBox_DeviceMarker.addEventListener("open", function (e) {
//         nationMarkerInfoboxOpened(info, e);
//     });
//     infoBox_DeviceMarker.addEventListener("close", function (e) {
//         nationMarkerInfoboxClosed(info, e);
//     });

//     map.panTo(point, { noAnimation: false });
//     infoBox_DeviceMarker.open(point);
// }

/**
 * 固定设备标注点描述窗口开启 - 显示站点详情折叠层
 * @param {Object} info 设备信息
 * @param {Event} e 
 */
function fixedMarkerInfoboxOpened(info, _e) {
    //隐藏小的弹窗
    if (info.infobox) {
        info.infobox.hide()
        info.infobox_dust.hide();
    };

    //销毁原有的设备数据曲线实例
    deviceRecentData_LineChart = null;

    //初始化挂载点位实时数据
    mountFixedDeviceDetail(DEVICE_DETAIL_PANEL.SWITCH_REAL_DATA, info.devicePoleId);

    //切换板事件绑定
    $('.mskbox ul li').on('click', function (event) {
        let deviceDetailTabIndex = parseInt(event.currentTarget.dataset.index);

        //设备详情面板 实时与趋势 选项卡切换
        if ($('.mskbox .tab li').hasClass('act')) {
            $('.mskbox .tab .act').removeClass('act');
            $('.mskbox .con .tabcon').hide();
        }
        $('.mskbox ul li:nth-child(' + deviceDetailTabIndex + ')').addClass('act');
        $('.mskbox .con .tabcon:nth-child(' + deviceDetailTabIndex + ')').show();

        mountFixedDeviceDetail(deviceDetailTabIndex, info.devicePoleId);
    });

    //video 事件绑定
    deviceVideoPlayerEventBinder(info);
}

/**
 * 设备视频播放器事件绑定
 * @param {Object} info - 设备信息
 */
function deviceVideoPlayerEventBinder(info) {
    //初始化、播放
    $('.mskbox #videoShowBtn').click(function () {
        $('.spcj').fadeIn();
        structureVideoPlayer(info.devicePoleId, info.projectName);
    });
    //视频播放页 关闭
    $('.spcj_close').click(function () {
        $('.spcj').fadeOut();
        disposeVideoPlayer();
    })
    //视频播放页 关闭
    $('.controls .iconshipinchuangkouguanbi').click(function () {
        $('.spcj').fadeOut();
        disposeVideoPlayer();
    })
    //视频回放、抓拍图片查看
    $('.spcj_box_con a').click(function () {
        console.log("功能暂未开通")
    });
    //最大化
    $(".iconshipinhuanyuan").click(function () {
        deviceVideoInstance.requestFullscreen();
    });

    //云台操作
    //  - 转向
    $('.spcj .controls1 .video-control').click(function () {
        let directionOps = $(this)[0].dataset;
        if (directionOps.direction !== void 0) {
            cameraDirectionControl(info.devicePoleId, directionOps.direction);
        }
    });
    //  - 抓拍
    $('.spcj #video-control-capture').click(function () {
        cameraCamtureControl(info.devicePoleId);
    });
    //  - 自动抓拍
    $('.spcj .controls1 .video-auto-capture').click(function () {
        cameraAutoCaptureControl(info.devicePoleId)
    });
}

/**
 * 云台摄像头方向控制
 * @param {Number} devicePoleId - 设备杆编号
 * @param {Number} direction - 方向序列号
 */
function cameraDirectionControl(devicePoleId, direction) {
    let reqParams = {
        poleid: devicePoleId,
        direction: direction
    };
    handleCommonAjaxRequest(deviceVideoDirectionControlUrl, 'GET', reqParams, function (res, err) {
        if (err) return;
    });
}

/**
 * 云台摄像头设备抓拍
 * @param {Number} devicePoleId - 设备杆编号
 */
function cameraCamtureControl(devicePoleId) {
    let reqParams = {
        poleid: devicePoleId
    }
    handleCommonAjaxRequest(deviceVideoCaptureControlUrl, 'GET', reqParams, function (res, err) {
        if (err) return;

        console.log("已成功抓拍~");
    });
}

/**
 * 云台摄像头自动抓拍
 * @param {Number} devicePoleId - 设备杆编号
 */
function cameraAutoCaptureControl(devicePoleId) {
    let reqParams = {
        poleid: devicePoleId
    };
    handleCommonAjaxRequest(deviceVideoAutoCaptureControlUrl, 'GET', reqParams, function (res, err) {
        if (err) return;

        console.log("自动抓拍中");
    });
}

/**
 * 注销视频播放器
 */
function disposeVideoPlayer() {
    //销毁倒计时计时器
    if (deviceVideoAutoCloseTId) {
        clearInterval(deviceVideoAutoCloseTId);
        deviceVideoAutoCloseTId = null;
    }

    //停用并卸载该实例的组件、销毁视频播放器实例
    if (deviceVideoInstance) {
        deviceVideoInstance.unuse(chimeePluginControlbar.name);
        Chimee.uninstall(chimeePluginControlbar.name);
        deviceVideoInstance.destroy();
        deviceVideoInstance = null;
    }
}

/**
 * 构造视频播放器
 * @param {Number} devicePoleId - 设备杆编号
 * @param {String} projectName - 站点名称
 */
function structureVideoPlayer(devicePoleId, projectName) {
    $('.videotil #main').text(projectName);
    $('.videotil #sub b').text('-');
    let reqParams = { poleid: devicePoleId };

    handleCommonAjaxRequest(deviceVideoAddressQueryUrl, 'GET', reqParams, function (res, err) {
        if (err) return;

        let countDwon = res.countDown || VIDEO_PLAY_COUNTDOWN;    //播放倒计时
        deviceVideoAutoCloseTId = setInterval(function () {
            if (countDwon === 0) {
                $('.spcj').fadeOut();
                disposeVideoPlayer();
            }
            $('.videotil #sub b').text(countDwon--);
        }, 1 * 1000);

        if (Object.keys(res).length > 0) {
            let defaultVideoSrc = res.hls || res.hlsHd,
                videoList = [];

            Object.keys(res).map(function (key) {
                let videoLink = res[key];
                if (videoLink && videoLink.length > 0) {
                    switch (key) {
                        case 'hls':
                            videoList.push({ name: '标清', src: videoLink });
                            break;
                        case 'hlsHd':
                            videoList.push({ name: '高清', src: videoLink });
                            break;
                        case 'rtmp':
                            // videoList.push({ src: videoLink });
                            break;
                        case 'rtmpHd':
                            // videoList.push({ src: videoLink });
                            break;
                        case 'flvAddress':
                            // videoList.push({ type: 'flv-application/octet-stream', src: videoLink });
                            break;
                        case 'flvAddressHd':
                            // videoList.push({ type: 'flv-application/octet-stream', src: videoLink });
                            break;
                    }
                }
                return true;
            });

            deviceVideoInstance && deviceVideoInstance.destroy();

            Chimee.install(chimeePluginControlbar); //工具栏插件
            deviceVideoInstance = new Chimee({
                src: defaultVideoSrc,
                isLive: 'live',
                wrapper: '#video_cotainer',
                kernels: {
                    hls: {
                        handler: ChimeeKernelHls
                    }
                },
                plugin: [
                    {
                        name: chimeePluginControlbar.name,
                        majorColor: '#00c3ff',
                        hoverColor: '#fff',
                        barShowByMouse: 'move',
                        children: {
                            progressBar: false,
                            clarity: {
                                list: [].concat(videoList),
                                duration: 3,
                                increment: 0
                            },
                            volume: {},
                            screen: {}
                        }
                    }
                ],
                controls: true,
                autoplay: true
            });
        } else {
            console.log('没有有效的视频源');
        }
    })
}

/**
 * 国控设备标注点描述窗口开启 - 显示站点详情折叠层
 * @param {Object} info 设备信息
 * @param {Event} e 
 */
function nationMarkerInfoboxOpened(info, e) {
    //隐藏小的弹窗
    if (info.infobox) {
        info.infobox.hide()
        info.infobox_aqi.hide();
    };

    //销毁原有的设备数据曲线实例
    deviceRecentData_LineChart = null;

    //初始化挂载点位实时数据
    mountNationDeviceDetail(DEVICE_DETAIL_PANEL.SWITCH_REAL_DATA, info.projectId);

    //切换板事件绑定
    $('.mskbox ul li').on('click', function (event) {
        let deviceDetailTabIndex = parseInt(event.currentTarget.dataset.index);

        //设备详情面板 实时与趋势 选项卡切换
        if ($('.mskbox .tab li').hasClass('act')) {
            $('.mskbox .tab .act').removeClass('act');
            $('.mskbox .con .tabcon').hide();
        }
        $('.mskbox ul li:nth-child(' + deviceDetailTabIndex + ')').addClass('act');
        $('.mskbox .con .tabcon:nth-child(' + deviceDetailTabIndex + ')').show();

        mountNationDeviceDetail(deviceDetailTabIndex, info.projectId);
    });
}

/**
 * 国控点位弹窗挂载数据
 * @param {Number} dataType  - 数据类型
 * @param {String} projectId - 项目编号
 */
function mountNationDeviceDetail(dataType, projectId) {
    let reqParams = { id: projectId };
    if (dataType === DEVICE_DETAIL_PANEL.SWITCH_RECENT_DATA) {
        //数据曲线
        handleCommonAjaxRequest(deviceNationDetail_RecentDataQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            if (res && res.length >= 0) {
                mountNationDevice_RecentData(res, projectId);
            }
        });
    } else {
        //实时数据
        handleCommonAjaxRequest(deviceNationDetail_RealtimeDataQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            if (res && Object.keys(res).length > 0) {
                mountNationDevice_RealTimeData(res, projectId);
            }
        });
    }
}

/**
 * 固定点位弹窗挂载数据
 * @param {Number} dataType  - 数据类型
 * @param {String} devicePoleId - 设备杆编号
 */
function mountFixedDeviceDetail(dataType, devicePoleId) {
    let reqParams = { id: devicePoleId };
    if (dataType === DEVICE_DETAIL_PANEL.SWITCH_RECENT_DATA) {
        //数据曲线
        handleCommonAjaxRequest(deviceFixedDetail_RecentDataQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            if (res && res.length >= 0) {
                mountFixedDevice_RecentData(res, devicePoleId);
            }
        });
    } else {
        //实时数据
        handleCommonAjaxRequest(deviceFixedDetail_RealtimeDataQueryUrl, 'GET', reqParams, function (res, err) {
            if (err) return;

            if (res && Object.keys(res).length > 0) {
                mountFixedDevice_RealTimeData(res, devicePoleId);
            }
        });
    }
}

/**
 * 点位弹窗挂载数据 - 设备实时数据
 * @param {Object} detailData 
 * @param {Number} devicePoleId 
 */
function mountFixedDevice_RealTimeData(detailData, devicePoleId) {
    let trStr = '';
    Object.keys(detailData).map(function (key) {
        switch (key) {
            case 't':
                trStr += '<tr>' +
                    '              <td>数据时间</td>' +
                    '              <td>' + detailData.t + '</td>' +
                    '        </tr>';
                break;
            case 'dust':
                trStr += '<tr>' +
                    '              <td>粉尘（mg/m³）</td>' +
                    '              <td>' + toFixed(detailData.dust, 3) + '</td>' +
                    '        </tr>';
                break;
            case 'temperature':
                trStr += '<tr>' +
                    '              <td>温度（℃）</td>' +
                    '              <td>' + toFixed(detailData.temperature, 1) + '</td>' +
                    '        </tr>';
                break;
            case 'humidity':
                trStr += '<tr>' +
                    '              <td>湿度（%RH）</td>' +
                    '              <td>' + toFixed(detailData.humidity, 1) + '</td>' +
                    '        </tr>';
                break;
            case 'atmos':
                trStr += '<tr>' +
                    '              <td>大气压（KPa）</td>' +
                    '              <td>' + toFixed(detailData.atmos, 1) + '</td>' +
                    '        </tr>';
                break;
            case 'windSpeed':
                trStr += '<tr>' +
                    '              <td>风速（m/s）</td>' +
                    '              <td>' + toFixed(detailData.windSpeed, 0) + '</td>' +
                    '        </tr>';
                break;
            case 'windDirection':
                trStr += '<tr>' +
                    '              <td>风向</td>' +
                    '              <td>' + toFixed(detailData.windDirection, 0) + '</td>' +
                    '        </tr>';
                break;
            case 'pm2.5':
                trStr += '<tr>' +
                    '              <td>PM2.5（mg/m³）</td>' +
                    '              <td>' + toFixed(detailData['pm2.5'], 3) + '</td>' +
                    '        </tr>';
                break;
        };
        return true;
    });

    $('#deviceDetailPanel_' + devicePoleId).html(trStr);
}

/**
 * 国控点位弹窗挂载数据 - 设备实时数据
 * @param {Object} detailData 
 * @param {Number} projectId 
 */
function mountNationDevice_RealTimeData(detailData, projectId) {
    let trStr = '';
    Object.keys(detailData).map(function (key) {
        switch (key) {
            case 't':
                trStr += '<tr>' +
                    '              <td>数据时间</td>' +
                    '              <td>' + detailData.t + '</td>' +
                    '        </tr>';
                break;
            case 'aqi':
                trStr += '<tr>' +
                    '              <td>空气质量指数</td>' +
                    '              <td>' + toFixed(detailData.aqi, 0) + '</td>' +
                    '        </tr>';
                break;
            case 'pm2.5':
                trStr += '<tr>' +
                    '              <td>PM2.5（mg/m³）</td>' +
                    '              <td>' + toFixed(detailData['pm2.5'], 3) + '</td>' +
                    '        </tr>';
                break;
            case 'pm10':
                trStr += '<tr>' +
                    '              <td>PM10（mg/m³）</td>' +
                    '              <td>' + toFixed(detailData['pm10'], 3) + '</td>' +
                    '        </tr>';
                break;
        };
        return true;
    });

    $('#deviceDetailPanel_' + projectId).html(trStr);
}

/**
 * 固定点位弹窗挂载数据 - 设备数据曲线
 * @param {Array} recentData 
 * @param {Number} devicePoleId 
 */
function mountFixedDevice_RecentData(recentData, devicePoleId) {
    let xAxisData = [], seriesData = [];

    recentData.map(function (item) {
        xAxisData.push(getFormatDateNew('ff', item.t));
        seriesData.push(toFixed(item.dust, 3));
        return true;
    });

    if (deviceRecentData_LineChart) {
        deviceRecentData_LineChart.setOption({
            series: [{
                data: seriesData
            }],
            xAxis: [{
                data: xAxisData
            }]
        });
    } else {
        deviceRecentData_LineChart = echarts.init(document.getElementById('deviceDetail_LineChart_' + devicePoleId), 'walden');

        // 指定图表的配置项和数据
        let option = {
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '15%',
                top: 30,
                right: '10%',
                bottom: 30
            },
            xAxis: {
                type: 'category',
                data: [].concat(xAxisData),
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: "粉尘(mg/m³)",
                axisLabel: {
                    formatter: "{value}"
                },
                nameTextStyle: {
                    "align": "left",
                    "fontWeight": 400,
                    "fontSize": 9,
                    "color": "#D5D4D3",
                    "padding": [
                        0,
                        0,
                        0,
                        -15
                    ]
                },
                nameGap: 18,
                splitLine: { show: false }
            },
            series: [{
                data: [].concat(seriesData),
                type: 'line',
                smooth: true
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        deviceRecentData_LineChart.setOption(option);
    }
}

/**
 * 国控点位弹窗挂载数据 - 设备数据曲线
 * @param {Array} recentData 
 * @param {Number} projectId 
 */
function mountNationDevice_RecentData(recentData, projectId) {
    let xAxisData = [], seriesData = [];

    let aqiDatas = [], pm25Datas = [], pm10Datas = [];

    recentData.map(function (item) {
        xAxisData.push(item.t);
        aqiDatas.push(item.aqi);
        pm25Datas.push(toFixed(item['pm2.5'], 3));
        pm10Datas.push(toFixed(item['pm10'], 3));
        return true;
    });

    seriesData.push({
        name: '空气质量状况',
        type: 'line',
        data: [].concat(aqiDatas),
        smooth: true
    });
    seriesData.push({
        name: 'PM2.5',
        type: 'line',
        data: [].concat(pm25Datas),
        smooth: true
    });
    seriesData.push({
        name: 'PM10',
        type: 'line',
        data: [].concat(pm10Datas),
        smooth: true
    });

    if (deviceRecentData_LineChart) {
        deviceRecentData_LineChart.setOption({
            series: [].concat(seriesData),
            xAxis: [{
                data: xAxisData
            }]
        });
    } else {
        deviceRecentData_LineChart = echarts.init(document.getElementById('deviceDetail_LineChart_' + projectId), 'walden');

        // 指定图表的配置项和数据
        let option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['空气质量状况', 'PM2.5', 'PM10']
            },
            grid: {
                left: '15%',
                top: 30,
                right: '10%',
                bottom: 30
            },
            xAxis: {
                type: 'category',
                data: [].concat(xAxisData),
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: "{value}"
                },
                nameTextStyle: {
                    align: 'left',
                    fontWeight: 'bold'
                },
                splitLine: { show: false }
            },
            series: [].concat(seriesData)
        };

        // 使用刚指定的配置项和数据显示图表。
        deviceRecentData_LineChart.setOption(option);
    }
}

//值的特殊处理
function toFixed(data, fix) {
    if (parseFloat(data) != void 0 && parseFloat(data) >= 0) {
        if (String(parseFloat(data)).length > 5) {
            return parseFloat(data).toFixed(fix);
        } else {
            return data;
        }
    } else {
        return '-';
    }
}

/**
 * 设备标注点描述窗口关闭 - 隐藏站点详情折叠层
 * @param {Object} info 设备信息
 * @param {Event} e 
 */
function fixedMarkerInfoboxClosed(info, e) {
    if (info.infobox && devicePointType.popShow[0]) info.infobox.show();
    if (info.infobox_dust && devicePointType.popShow[1]) info.infobox_dust.show();
}

/**
 * 国控设备标注点描述窗口关闭 - 隐藏站点详情折叠层
 * @param {Object} info 设备信息
 * @param {Event} e 
 */
function nationMarkerInfoboxClosed(info, e) {
    if (info.infobox && devicePointType.popShow[0]) info.infobox.show();
    if (info.infobox_aqi && devicePointType.popShow[1]) info.infobox_aqi.show();
}

/**
 * 设备状态图示
 */
function renderDeviceStatusStatistic_PieChart() {
    let myChart = echarts.init(document.getElementById('deviceStatusStatistic_PieChart'));

    //过滤掉被隐藏的项
    let deviceStateStatisticFilter = Object.assign({}, deviceStateStatistic);
    hiddenLegend.length > 0 && hiddenLegend.map(function (state) {
        delete deviceStateStatisticFilter[state];
        return true;
    });


    //Echarts 图例数据数据、类目数据
    const PieLegend = [{
        key: 'onlineCount',
        name: '优良'
    }, {
        key: 'warningCount',
        name: '预警'
    }, {
        key: 'overStandardCount',
        name: '超标'
    }, {
        key: 'offlineCount',
        name: '断线'
    }];

    let deviceCount = 0;
    if (Object.values(deviceStateStatisticFilter).length > 0) {
        deviceCount = Object.values(deviceStateStatisticFilter).reduce(function (a, b) { return a + b });
    }

    let validKey = Object.keys(deviceStateStatisticFilter).filter(function (key) { return deviceStateStatisticFilter[key] > 0 });
    let pieLegend = PieLegend.filter(function (item) { return validKey.findIndex(function (key) { return item.key === key; }) > -1; }),
        legendColors = [];
    Object.values(DEVICE_STATUS).map(function (item) {
        if (validKey.findIndex(function (key) { return item.key === key; }) > -1) {
            legendColors.push(item.color);
        }
        return true;
    });

    let echartsOptios = structureEchartsPieOptions(deviceCount, pieLegend, deviceStateStatisticFilter, legendColors);

    //Eharts 数据绑定
    myChart.setOption(echartsOptios);
}

/**
 * 构建饼图配置
 * @param {Number} deviceCount - 设备总数
 * @param {Object} pieArr - 图例
 * @param {Object} seriesData - 扇叶数据
 * @param {Object} legendColors - 自定义颜色
 */
function structureEchartsPieOptions(deviceCount, pieArr, seriesData, legendColors) {
    let pieOptions = {};
    pieOptions.title = {
        text: deviceCount,
        subtext: '设备总数',
        x: 'center',
        y: 'center',
        textStyle: {
            fontSize: 22,
            color: '#FFFFFF',
            fontWeight: 700,
            rich: {
                align: 'center'
            }
        },
        subtextStyle: {
            fontSize: 12,
            color: '#FFFFFF',
            align: 'center'
        },
        itemGap: 1
    };
    pieOptions.tooltip = {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
    };
    pieOptions.legend = {
        show: false
    };

    pieOptions.series = [
        {
            name: '设备状态',
            type: "pie",
            radius: ['45%', '55%'],
            center: ['50%', '50%'],
            minAngle: 45,
            label: {
                formatter: '{c|{c}}{abg|}\n\n{hr|———}\n{b|{b}}',
                rich: {
                    c: {
                        fontSize: 22,
                        fontWeight: 700,
                        lineHeight: 22,
                        align: 'center',
                        padding: [-20, 0, 0, 0]
                    },
                    abg: {
                        width: '100%',
                        align: 'right',
                        height: 22,
                        borderRadius: [4, 4, 0, 0]
                    },
                    hr: {
                        width: '100%',
                        borderWidth: 1,
                        height: 0
                    },
                    b: {
                        fontSize: 14,
                        fontWeight: 400,
                        lineHeight: 33,
                        color: '#FFFFFF',
                        padding: [10, 0, 0, 0]
                    }
                }
            },
            data: pieArr.map(function (item) {
                return {
                    name: item.name,
                    value: seriesData[item.key]
                };
            })
        }
    ];
    pieOptions.grid = {
        top: 10
    };
    pieOptions.color = legendColors;
    return pieOptions;
}

/**
 * 更新区域扬尘时均值
 * @param {String} t - 时间，精确到小时，时间格式： yyyymmddhh
 */
function getDistrictDustAvgsForHourData(t) {
    // if(dustAvgsGeoCharts){
    //     //
    // }else {
    echarts.dispose(document.getElementById('areaDustStatistic_GeoChart'));
    let myChart = echarts.init(document.getElementById('areaDustStatistic_GeoChart'));

    let reqParams = {
        t: t || getFormatDateNew('b').slice(0, 10).toString()
    };

    handleCommonAjaxRequest(districtDustAvgsForHourDataQueryUrl, 'GET', reqParams, function (res, err) {
        if (err) return;

        if (res && res.length > 0) {
            let seriesData = [];
            districtComboData.list.map(function (item) {
                let matchDistrict = res.filter(function (d) { return parseInt(d.id) === parseInt(item.id) });

                if (matchDistrict[0]) {
                    let districtName = item.districtName
                    if (item.id === 3) {
                        districtName = '\n\n\n西湖区';
                    } else if (item.id === 15) {
                        districtName = '风景区';
                    }
                    seriesData.push({
                        id: item.id,
                        value: matchDistrict[0] ? toFixed(matchDistrict[0].dust, 3).toString() : 0,
                        name: districtName
                    });
                }
            });

            //获取杭州地理区划坐标集
            if (hzGeoData && Object.keys(hzGeoData).length > 0) {
                renderAreaDustStatistic_GeoChart(myChart, hzGeoData, seriesData);
            } else {
                handleCommonAjaxRequest(hmSiteGeoDataQueryUrl, 'GET', {}, function (res, err) {
                    hzGeoData = res || {};
                    renderAreaDustStatistic_GeoChart(myChart, hzGeoData, seriesData);
                }, true);
            }
            return true;
        }
    });
    // }
}

/**
 * 区域扬尘浓度 - 地理热力图
 * @param {Object} seriesData - 区域扬尘均值数据
 */
function renderAreaDustStatistic_GeoChart(myChart, geoJson, seriesData) {
    // myChart.hideLoading();
    let echartsOptios = structureEchartsGeoOptions(seriesData);

    echarts.registerMap('HZ', geoJson);
    //Eharts 数据绑定
    myChart.setOption(echartsOptios);

    let hoveredDistrictId = null;
    myChart.on('mouseover', function (params) {
        if (params.data && params.data.id) hoveredDistrictId = params.data.id;
    })
    myChart.on('mouseout', function () {
        hoveredDistrictId = null;
    });

    if (myChart.getZr && myChart.getZr().on) {
        myChart.getZr().on('click', function () {
            let districtId = '0', districtName = ''
            if (hoveredDistrictId && String(hoveredDistrictId).length > 0) {
                districtId = hoveredDistrictId;
                districtComboData.currentSelectDistrictId = hoveredDistrictId;

                let matchItem = districtComboData.list.filter(function (item) { return parseInt(item.id) === parseInt(districtId) });
                if (matchItem[0]) {
                    districtName = matchItem[0].districtName || '';
                }
            }

            districtIdOnChange(districtId, districtName, true);
        });
    }
}

/**
 * 构建geo 地理图配置
 * @param {Object} seriesData - 填充数据
 */
function structureEchartsGeoOptions(seriesData) {
    let geoOptions = {};
    geoOptions.tooltip = {
        trigger: 'item',
        formatter: '{b}<br/>{c} mg/m³'
    };
    geoOptions.visualMap = {
        min: 0,
        max: 1,
        text: ['高', '低'],
        textStyle: {
            color: '#FFFFFF'
        },
        realtime: false,
        calculable: true,
        left: 1,
        show: false,
        type: 'piecewise',
        pieces: [
            {
                gte: 0,
                lt: 0.02,
                color: "#059be5"
            },
            {
                gte: 0.02,
                lt: 0.05,
                color: "#019fc2"
            },
            {
                gte: 0.05,
                lt: 0.1,
                color: "#039e98"
            },
            {
                gte: 0.1,
                lt: 0.15,
                color: "#009c6d"
            },
            {
                gte: 0.15,
                lt: 0.2,
                color: "#009946"
            },
            {
                gte: 0.2,
                lt: 0.25,
                color: "#23ac3a"
            },
            {
                gte: 0.25,
                lt: 0.3,
                color: "#90c223"
            },
            {
                gte: 0.3,
                lt: 0.35,
                color: "#cedc00"
            },
            {
                gte: 0.35,
                lt: 0.4,
                color: "#ffef01"
            },
            {
                gte: 0.4,
                lt: 0.45,
                color: "#fdc703"
            },
            {
                gte: 0.45,
                lt: 0.5,
                color: "#f29700"
            },
            {
                gte: 0.5,
                lt: 0.55,
                color: "#ec6001"
            },
            {
                gte: 0.55,
                lt: 0.6,
                color: "#e70012"
            },
            {
                gte: 0.6,
                lt: 0.65,
                color: "#E40150"
            },
            {
                gte: 0.65,
                lt: 0.7,
                color: "#e80137"
            },
            {
                gte: 0.7,
                lt: 0.75,
                color: "#e6006a"
            },
            {
                gte: 0.75,
                lt: 0.8,
                color: "#e6007f"
            },
            {
                gte: 0.8,
                lt: 0.85,
                color: "#bf0082"
            },
            {
                gte: 0.85,
                lt: 0.9,
                color: "#950684"
            },
            {
                gte: 0.9,
                lt: 0.95,
                color: "#611786"
            },
            {
                gte: 0.95,
                lt: 1,
                color: "#1d208b"
            },
            {
                gte: 1,
                color: "#000000"
            }
        ]
    };
    geoOptions.legend = {
        show: false
    };

    geoOptions.series = [
        {
            name: '杭州市区域扬尘密度',
            type: 'map',
            mapType: 'HZ',
            label: { show: true },
            data: [].concat(seriesData),
            zoom: 1.2
        }
    ];
    return geoOptions;
}

/**
 * 更新天气数据
 * @param {String} t - 时间，精确到小时，时间格式： yyyymmddhh
 */
function getWeatherData(t) {
    let reqParams = {
        t: t || getFormatDateNew('b').slice(0, 10).toString()
    };

    handleCommonAjaxRequest(weatherDataQueryUrl, 'GET', reqParams, function (res, err) {
        if (err) return;

        if (res && Object.keys(res).length > 0) {
            $('.weather .weather-t .weather-icon').css('background-image', 'url("' + res.weatherImg + '")');                 //天气icon
            $('.weather .weather-t .weather-t1 span').text(res.weatherQuality + res.weatherQualityDesc);                    //空气质量 + 描述
            $('.weather .weather-t .weather-t1 span').css('background', weatherAQIColorMatch(res.weatherQuality));          //空气质量颜色码
            $('.weather .weather-t .weather-t1 p').text(res.weatherDesc);                                                   //天气描述
            $('.weather .weather-t .weather-t1 s').text(res.temperature + ' ℃');                                           //温度
            $('.weather .weather-t .city span').text(res.areaName);                                                         //市区
            $('.weather .clearfix .humidity span').text(res.humidity);                                                      //大气湿度
            $('.weather .clearfix .wind span').text(res.windDirection + ' ' + res.windRank);                                //风向、风力等级
            $('.weather .clearfix .airpressure span').text(res.airpressure);                                                //大气压值
            $('.weather .clearfix .rainfall span').text(res.rainfall);                                                      //降雨量
            return true;
        }
    })
}

/**
 * 匹配空气质量指数颜色码
 * @param {String} aqi - 当前空气质量指数
 * @returns {String} - 颜色码
 */
function weatherAQIColorMatch(aqi) {
    //[最小值， 最大值)
    const AQI_COLOR_RANGE = [
        [0, 50, '#73FF73'],
        [50, 100, '#FFFF82'],
        [100, 150, '#FFB973'],
        [150, 200, '#FF7373'],
        [200, 300, '#AF7373'],
        [300, 500, '#737373'],
        [500, 800, '#555555']
    ];

    let matchItem = AQI_COLOR_RANGE.filter(function (item) { return aqi >= item[0] && aqi < item[1] });
    return matchItem.length > 0 ? matchItem[0][2] : '#000000';
}

/**
 * 更新右侧面板数据展示
 * @param {String} t - 时间点 精确到分钟，格式 "yyyymmdd"
 * @param {*} timeType - 日期类型， 默认“小时”
 */
function updateRightPanelData(t, timeType) {
    t = t || getFormatDateNew('b', worldTime.t).slice(0, 8).toString();
    timeType = timeType || 1;

    //扬尘趋势
    createDustRecentDataQueryTimer(t, timeType);

    //扬尘排行
    createDustRankDataQueryTimer(t, timeType);
}

/**
 * 创建扬尘趋势查询计时器
 * @param {String} t - 时间点 精确到分钟，格式 "yyyymmddhhii"
 * @param {Number} timeType - 日期类型，默认 1 (小时)
 * @param {Number} dataType - 数据类型，默认 1 (全市)
 */
function createDustRecentDataQueryTimer(t, timeType, dataType) {
    dataType = dataType || currentRecentDustType;

    //重置图表实例
    cityDustData_LineChart = null;
    districtDustData_BarChart = null;

    // 市区扬尘趋势变更
    getRecentData(t, timeType, dataType);

    //重置计时器
    clearInterval(dustRecentDataTId);

    dustRecentDataTId = setInterval(function () {
        //市区扬尘趋势变更
        getRecentData(t, timeType, dataType);
    }, 60 * 60 * 1000);
}

/**
 * 创建扬尘排行查询计时器
 * @param {String} t - 时间点 精确到分钟，格式 "yyyymmddhhii"
 * @param {Number} timeType - 日期类型，默认 1 (小时)
 * @param {Number} dataType - 数据类型，默认 1 (扬尘控制最好)
 */
function createDustRankDataQueryTimer(t, timeType, dataType) {
    dataType = dataType || currentRankDustTye;

    //扬尘趋势排行
    getDustRank(t, timeType, dataType);

    //重置计时器
    clearInterval(dustRankDataTId);

    dustRankDataTId = setInterval(function () {
        //扬尘趋势排行
        getDustRank(t, timeType, dataType);
    }, 60 * 60 * 1000);
}

let timeControlDataUpdateAllow = true;  //时间组件事件触发许可
/**
 * 初始化时间面板、监听点击事件
 * @param {String} t - 当前时间(规则的日期格式)
 */
function mountTimeData() {
    $('.day').click(function () {
        if (timeControlDataUpdateAllow) {
            timeControlDataUpdateAllow = false;
            $(this).addClass("active").siblings().removeClass('active');

            $(".selectedtimebox .selectedtime span").show();

            updateTimeData(1, worldTime.t);
        }
    });
    $('.mon').click(function () {
        if (timeControlDataUpdateAllow) {
            timeControlDataUpdateAllow = false;
            $(this).addClass("active").siblings().removeClass('active');

            $(".selectedtimebox .selectedtime .selectemon").show();
            $(".selectedtimebox .selectedtime .selecteday").hide();

            updateTimeData(2, worldTime.t);
        }
    });
    $('.year').click(function () {
        if (timeControlDataUpdateAllow) {
            timeControlDataUpdateAllow = false;
            $(this).addClass("active").siblings().removeClass('active');

            $(".selectedtimebox .selectedtime .selectemon").hide();
            $(".selectedtimebox .selectedtime .selecteday").hide();

            updateTimeData(3, worldTime.t);
        }
    });
    $('.today').click(function () {
        if (timeControlDataUpdateAllow) {
            timeControlDataUpdateAllow = false;
            $(this).siblings('.day').addClass('active').siblings().removeClass('active');
            $(".selectedtimebox .selectedtime span").show();
            updateTimeData(1, new Date());
        }
    });
    $('.selectedtimebox .ml').click(function () {
        if (timeControlDataUpdateAllow) {
            timeControlDataUpdateAllow = false;
            updateTimeData(worldTime.currentTimeType, worldTime.t, -1);
        }
    });
    $('.selectedtimebox .mr').click(function () {
        if (timeControlDataUpdateAllow) {
            timeControlDataUpdateAllow = false;
            updateTimeData(worldTime.currentTimeType, worldTime.t, 1);
        }
    });

    //更新为当前服务器时间
    updateTimeData();
}

/**
 * 更新世界时间
 * @param {Number} timeType - 时间类型, 枚举值 1【日】、2【月】、3【年】
 * @param {String} t - 当前时间(规则的日期格式)
 * @param {Number} diff - 差值, 取值： 1 或 -1
 */
function updateTimeData(timeType, t, diff) {
    worldTime.currentTimeType = timeType || 1;

    t = t != void 0 ? new Date(getFormatDateNew('a', t)) : new Date();
    diff = diff || 0;

    let currentT = new Date(),
        validValue = true,      //是否为有效的时间, <= 当前时间
        forbiddenPlus = false;  //是否禁用 “+” 按钮

    switch (timeType) {
        case 3:   //年
            t = new Date(t.setFullYear(t.getFullYear() + diff));
            validValue = checkTimeValid(t, currentT, 4, timeType);
            forbiddenPlus = checkTimeValid(t, currentT, 2, timeType);
            break;
        case 2:   //月
            if (diff !== 0) {
                if (t.getDate() < getDaysOfMonth(t.getFullYear(), t.getMonth() + 1 + diff)) {
                    t = new Date(t.setMonth(t.getMonth() + diff));
                } else {
                    t = new Date(t.setMonth(new Date(t.setMonth(t.getMonth() - 1)).getMonth() - 1));
                }
            }

            validValue = checkTimeValid(t, currentT, 4, timeType);
            forbiddenPlus = checkTimeValid(t, currentT, 2, timeType);
            break;
        default:  //日
            t = new Date(t.setDate(t.getDate() + diff));
            validValue = checkTimeValid(t, currentT, 4, timeType);
            forbiddenPlus = checkTimeValid(t, currentT, 2, timeType);
            break;
    }


    if (validValue) {
        const _ = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
        let y = _[t.getFullYear()] || t.getFullYear(),
            m = _[t.getMonth() + 1] || (t.getMonth() + 1),
            d = _[t.getDate()] || t.getDate();
        worldTime.y = y;
        worldTime.m = m;
        worldTime.d = d;
        worldTime.t = t;

        //变更世界时间
        $('.selectedtimebox .selectedtime .selectedyear').text(y);
        $('.selectedtimebox .selectedtime .selectemon .v').text(m);
        $('.selectedtimebox .selectedtime .selecteday .v').text(d);

        //更新扬尘趋势、排行数据
        updateRightPanelData(matchValidTimeValue(timeType), timeType);
        updateRankListTabTitle();
    } else {
        //无效数据 -> 重置事件许可
        timeControlDataUpdateAllow = true;
    }

    if (forbiddenPlus) {
        $('.selectedtimebox .mr').css('color', '#9A9A9A');
        $('.selectedtimebox .mr').css('cursor', 'not-allowed');
    } else {
        $('.selectedtimebox .mr').css('color', '#FFFFFF');
        $('.selectedtimebox .mr').css('cursor', 'pointer');
    }
}

/**
 * 验证当前时间的相对有效性
 * @param {Date} cT - 当前时间
 * @param {Date} tT - 目标时间
 * @param {Number} type 对比的类型, 对应枚举值 1: >; 2: >=; 3: <; 4、<=; 5、==;
 * @param {Number} timeType - 时间类型, 枚举值 1【日】、2【月】、3【年】
 */
function checkTimeValid(cT, tT, type, timeType) {
    let cT_Z, tT_Z; //对应时间的10位数时间戳

    const _ = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];

    switch (timeType) {
        case 3:   //年
            cT_Z = getFormatDateNew('d', cT.getFullYear() + '-01-01 00:00:00');
            tT_Z = getFormatDateNew('d', tT.getFullYear() + '-01-01 00:00:00');
            break;
        case 2:   //月
            cT_Z = getFormatDateNew('d', cT.getFullYear() + '-' + (_[cT.getMonth() + 1] || cT.getMonth() + 1) + '-01 00:00:00');
            tT_Z = getFormatDateNew('d', tT.getFullYear() + '-' + (_[tT.getMonth() + 1] || tT.getMonth() + 1) + '-01 00:00:00');
            break;
        default:  //日
            cT_Z = getFormatDateNew('d', cT.getFullYear() + '-' + (_[cT.getMonth() + 1] || cT.getMonth() + 1) + '-' + (_[cT.getDate()] || cT.getDate()) + ' 00:00:00');
            tT_Z = getFormatDateNew('d', tT.getFullYear() + '-' + (_[tT.getMonth() + 1] || tT.getMonth() + 1) + '-' + (_[tT.getDate()] || tT.getDate()) + ' 00:00:00');
            break;
    }

    switch (type) {
        case 1:
            return cT_Z > tT_Z;
        case 2:
            return cT_Z >= tT_Z;
        case 3:
            return cT_Z < tT_Z;
        case 4:
            return cT_Z <= tT_Z;
        case 5:
            return cT_Z == tT_Z;
    }

    return false;
}

/**
 * 获取当前月的总天数
 * @param {Number} year - 年份
 * @param {Number} month - 当前月份
 */
function getDaysOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * 市、区县 扬尘趋势数据查询
 * @param {String} t - 时间点 精确到分钟，格式 "yyyymmddhhii"
 * @param {Number} timeType - 日期类型，默认 1 (小时)
 * @param {Number} dataType - 数据类型，默认 1 (全市)
 */
function getRecentData(t, timeType, dataType) {
    dataType = dataType ? dataType : RECENT_DUST_TYPE.CITY;

    let url = dataType === RECENT_DUST_TYPE.CITY ? recentData_CityDustQueryUrl : recentData_DistrictDustQueryUrl,
        reqParams = {
            dataType: timeType,
            t: t
        };

    handleCommonAjaxRequest(url, 'GET', reqParams, function (res, err) {
        if (err) return;

        if (dataType === RECENT_DUST_TYPE.CITY) {
            renderRecentCityDustData_LineChart(res, timeType);
        } else {
            renderRecentDistrictDustData_BarChart(res, timeType);
        }
    });
}

/**
 * 站点扬尘控制排行数据查询
 * @param {String} t - 时间点 精确到分钟，格式 "yyyymmddhhii"
 * @param {Number} timeType - 日期类型，默认 1 (小时)
 * @param {Number} rankType - 排名类型，默认 1 （最好）
 */
function getDustRank(t, timeType, rankType) {
    rankType = rankType ? rankType : DUST_RANK_TYPE.BEST;

    let url = rankType === DUST_RANK_TYPE.BEST ? dustRank_BestDeviceListQueryUrl : dustRank_WorstDeviceListQueryUrl,
        reqParams = {
            dataType: timeType,
            t: t
        };

    handleCommonAjaxRequest(url, 'GET', reqParams, function (res, err) {
        //清理面板内容
        let domId = rankType === DUST_RANK_TYPE.BEST ? 'dustBestRankList' : 'dustWorstRankList';
        $("#" + domId + " tbody").html('');

        timeControlDataUpdateAllow = true;
        if (err) return;

        if (res && res.length > 0) {
            res.map(function (item, _index) {
                $("#" + domId + " tbody").append(
                    '<tr data-id="' + item.id + '">' +
                    '<td class="rank1"><i class="iconfont">&#xe601;</i><s>1<s/></td>' +
                    '   <td><i class="iconfont iconweizhi"></i>' + item.name + '</td>' +
                    '   <td>' + toFixed(item.d, 3) + '</td>' +
                    '   <td>' + item.districtName + '</td>' +
                    '</tr>'
                );
                return true;
            })
        }
        $('.ranklist tbody tr').click(function () {
            $(this).addClass("active").siblings().removeClass("active");
            let projectId = $(this)[0].dataset.id;

            //状态点选中
            $('.statusboxlegend ul .li1 s:not(".dot")').addClass('dot');

            if (projectId) {
                dingWei(projectId);
            }
        });
    });
}

/**
 * 全市扬尘趋势图形绘制
 * @param {Array} lineDatas 表格数据
 * @param {Number} timeType - 日期类型，默认 1 (小时)
 */
function renderRecentCityDustData_LineChart(lineDatas, timeType) {
    let xAxisData = [], seriesData = [];
    let currentT = new Date();
    if (lineDatas && lineDatas.length > 0) {
        lineDatas.map(function (item) {
            let unitName = '时',
                currentDateNumber,
                targetDateNumber,
                isCurrentT = false;

            switch (parseInt(timeType)) {
                case 1:     //日
                    unitName = '时';
                    currentDateNumber = parseInt(item.t);
                    targetDateNumber = parseInt(worldTime.t.getHours());
                    isCurrentT = currentT.getFullYear() === parseInt(worldTime.y) && (currentT.getMonth() + 1) === parseInt(worldTime.m) && currentT.getDate() === parseInt(worldTime.d);
                    break;
                case 2:     //月
                    unitName = '日';
                    currentDateNumber = parseInt(item.t);
                    targetDateNumber = parseInt(worldTime.d);
                    isCurrentT = currentT.getFullYear() === parseInt(worldTime.y) && (currentT.getMonth() + 1) === parseInt(worldTime.m);
                    break;
                case 3:     //年
                    unitName = '月';
                    currentDateNumber = parseInt(item.t);
                    targetDateNumber = parseInt(worldTime.m);
                    isCurrentT = currentT.getFullYear() === parseInt(worldTime.y);
                    break;
            }

            xAxisData.push(item.t + unitName);

            if (isCurrentT) {
                if (currentDateNumber < targetDateNumber) {
                    seriesData.push(toFixed(item.d, 3));
                } else {
                    seriesData.push('');
                }
            } else {
                seriesData.push(toFixed(item.d, 3));
            }

            return true;
        });
    }

    if (cityDustData_LineChart) {
        cityDustData_LineChart.setOption({
            xAxis: [{ data: xAxisData }],
            series: [{ data: seriesData }]
        });
    } else {
        cityDustData_LineChart = echarts.init(document.getElementById('recentData_CityDust_LineChart'), 'walden');

        //构建配置项
        let echartsOptios = structureCityDustDataLineOptions(xAxisData, seriesData);
        cityDustData_LineChart.setOption(echartsOptios);

        cityDustData_LineChart.on('mouseover', 'series.line', function (params) {
            if (timeControlDataUpdateAllow) {
                timeControlDataUpdateAllow = false;
                clearTimeout(recentCityDustPopResetQueryTId);
                clearInterval(dustRecentDataTId);

                const _ = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
                let v = params.name.slice(0, -1);
                let t = matchValidTimeValue(worldTime.currentTimeType) + (_[v] || v);

                //变更排行Tab 标题
                updateRankListTabTitle(v);

                //查询请求
                getDustRank(t, worldTime.currentTimeType - 1, currentRankDustTye);
            }
        })

        cityDustData_LineChart.on('mouseout', 'series.line', function () {
            if (timeControlDataUpdateAllow) {
                recentCityDustPopResetQueryTId = setTimeout(function () {
                    //重置排行Tab 标题
                    updateRankListTabTitle();
                    //重置查询请求
                    createDustRankDataQueryTimer(matchValidTimeValue(worldTime.currentTimeType), worldTime.currentTimeType, currentRankDustTye);
                }, 3 * 1000);
            }
        })
    }
}

/**
 * 构建全市扬尘趋势曲线图配置
 * @param {Array} xAxisData - 图表X轴刻度数据
 * @param {Array} seriesData - 曲线展示数据
 */
function structureCityDustDataLineOptions(xAxisData, seriesData) {
    let lineOptions = {};
    lineOptions.tooltip = {
        trigger: 'axis',
        formatter: function (params) {
            params = params[0];
            return params.name + ' ' + params.value + 'mg/m³';
        },
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    };
    lineOptions.xAxis = {
        type: 'category',
        data: xAxisData,
        splitLine: { show: false }
    };
    lineOptions.yAxis = {
        type: "value",
        name: "粉尘（mg/m³）",
        axisLabel: {
            "formatter": "{value}"
        },
        nameTextStyle: {
            "align": "left",
            "fontWeight": 400,
            "fontSize": 16,
            "color": "#00BAFF",
            "padding": [
                0,
                0,
                0,
                -15
            ]
        },
        nameGap: 18,
        splitLine: { show: false }
    };

    lineOptions.grid = {
        left: '10%',
        top: 42,
        right: '5%',
        bottom: 32
    };

    lineOptions.series = {
        type: 'line',
        smooth: true,
        data: seriesData
    };
    return lineOptions;
}

/**
 * 各区县扬尘趋势图形绘制
 * @param {Array} barDatas - 曲线扬尘趋势数据
 * @param {Nyumber} timeType - 时间类型
 */
function renderRecentDistrictDustData_BarChart(barDatas, timeType) {
    let xAxisData = [], seriesData = [];
    if (barDatas && barDatas.length > 0) {
        barDatas.map(function (item) {
            xAxisData.push(item.districtName || '-');
            seriesData.push(toFixed(item.d, 3));
            return true;
        });
    }

    if (districtDustData_BarChart) {
        districtDustData_BarChart.setOption({
            xAxis: [{ data: xAxisData }],
            series: [{ data: seriesData }]
        });
    } else {
        districtDustData_BarChart = echarts.init(document.getElementById('recentData_CityDust_BarChart'), 'walden');

        //构建配置项
        let echartsOptios = structureDistrictDustDataBarOptions(xAxisData, seriesData);
        districtDustData_BarChart.setOption(echartsOptios);
    }
}

/**
 * 构建区县扬尘趋势饼状图配置
 * @param {Array} xAxisData - 图表X轴刻度数据
 * @param {Array} seriesData - 曲线展示数据
 */
function structureDistrictDustDataBarOptions(xAxisData, seriesData) {
    let barOptions = {};
    barOptions.tooltip = {
        trigger: 'axis',
        formatter: function (params) {
            params = params[0];
            return params.name + ' ' + params.value + 'mg/m³';
        },
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    };
    barOptions.xAxis = {
        type: 'category',
        data: xAxisData,
        axisLabel: { 'interval': 0, 'rotate': 40, padding: [20, 0, 0, 0] },
        axisTick: { alignWithLabel: true },
        splitLine: { show: false }
    };
    barOptions.yAxis = {
        type: "value",
        name: "粉尘（mg/m³）",
        axisLabel: {
            "formatter": "{value}"
        },
        nameTextStyle: {
            "align": "left",
            "fontWeight": 400,
            "fontSize": 16,
            "color": "#00BAFF",
            "padding": [
                0,
                0,
                0,
                -15
            ]
        },
        nameGap: 18,
        splitLine: { show: false }
    };

    barOptions.grid = {
        left: '10%',
        top: 42,
        right: '10%',
        bottom: 80
    };

    barOptions.series = {
        type: 'bar',
        data: seriesData,
        barWidth: '30%',
        markLine: {
            data: [
                {
                    "type": "average",
                    "name": "平均值"
                }
            ],
            lineStyle: {
                color: '#FF0000'
            },
            label: {
                position: 'end'
            }
        }
    };
    return barOptions;
}

/**
 * 变更设备类型展示列表
 * @param {String} deviceType 
 */
function updateDeviceTypeSwitchList(deviceType) {
    switch (deviceType) {
        case 'points_Fixed':
            Object.values(deviceFixedMarkerList).map(function (device) {
                if (!devicePointType.points_Fixed.show) {
                    map.addOverlay(device.marker);
                    if (devicePointType.popShow[0]) {
                        device.infobox.show();
                    }
                    if (devicePointType.popShow[1]) {
                        device.infobox_dust.show();
                    }
                } else {
                    map.removeOverlay(device.marker);
                    if (devicePointType.popShow[0]) {
                        device.infobox.hide();
                    }
                    if (devicePointType.popShow[1]) {
                        device.infobox_dust.hide();
                    }
                }
                return true;
            });
            break;
        case 'points_move':
            break;
        case 'points_nation':
            Object.values(deviceNationMarkerList).map(function (device) {
                if (!devicePointType.points_nation.show) {
                    map.addOverlay(device.marker);
                    if (devicePointType.popShow[0]) {
                        device.infobox.show();
                    }
                    if (devicePointType.popShow[1]) {
                        device.infobox_aqi.show();
                    }
                } else {
                    map.removeOverlay(device.marker);
                    if (devicePointType.popShow[0]) {
                        device.infobox.hide();
                    }
                    if (devicePointType.popShow[1]) {
                        device.infobox_aqi.hide();
                    }
                }
                return true;
            });
            break;
    }

    if (infoBox_DeviceMarker) {
        infoBox_DeviceMarker.close();
        infoBox_DeviceMarker = null;
    }

    //同步状态
    devicePointType[deviceType].show = !devicePointType[deviceType].show;
}

/**
 * 构造时间参数
 * @param {Number} dataType - 数据类型，枚举值： 1 【日】，2【月】， 3【年】
 * @returns {String} 'YYYYYYMMDD' || 'YYYYMM' || 'YYYY'
 */
function matchValidTimeValue(dataType) {
    dataType = dataType || 1;

    let t = [worldTime.y, worldTime.m, worldTime.d];
    let l = t.length - dataType + 1;
    return t.slice(0, l).join('');
}

/**
 * 更新追溯时间列表、监听监听事件
 */
function updatePlaybackTimeList() {
    let playBackTimeList = [];
    const _ = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    for (let i = 0; i < 5; i++) {
        let targetT = new Date(new Date().setDate(new Date().getDate() - i));
        playBackTimeList.push({
            t: getFormatDateNew('h', targetT),
            w: _[targetT.getDay()]
        });
    }

    let timePanelHtmlStr = '';
    playBackTimeList.map(function (item) {
        timePanelHtmlStr += (
            '<li data-t="' + item.t + '">' +
            '<div class="time">' + item.t + '<br>' + item.w + '</div>' +
            '<div class="play"></div>' +
            '</li>'
        );
        return true;
    })

    $('.bottombox .bottombox_con .backtrack').html(timePanelHtmlStr);
    $('.bottombox .bottombox_con .backtrack li').on('click', function () {
        let panelT = $(this)[0].dataset.t;
        updateTimeUnionData(panelT);
    });
}

/**
 * 还原世界时间
 */
function restoreWorldTime() {
    //重置追溯时间面板
    $('.bottombox .bottombox_con .backtrack').html('');

    //还原世界时间
}

/**
 * 更新与时间相关的联动数据
 * @param {String} t - 时间，数据格式 'yyyy-mm-dd'
 */
function updateTimeUnionData(t) {
    //销毁在运行的计时器
    clearInterval(deviceFixedListQueryTId);     //固定点位查询
    clearInterval(deviceNationListQueryTId);    //国控点位
    clearInterval(deviceMovedListQueryTId);     //移动监测点位
    clearInterval(weatherDataQueryTId);         //天气数据
    clearInterval(districtDustAvgsHDTId);       //扬尘均值

    const _ = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
    let hourLine = new Array(24).join(',').split(',').map(function (_k, index) { return _[index] || '' + index });

    if (new Date(t).getDate() === new Date().getDate()) {
        hourLine = hourLine.filter(function (h) { return parseInt(h) < new Date().getHours() });
    }

    t = t.replace(/-/g, '');
    timeUnionDataQueryBuilder(t, hourLine);
}

/**
 * 追溯控制器
 * @param {Number} type - 功能类型 REPLAYBACK_CONTROLS
 * @param {String} value - 步进的值或调整后的速率倍数
 */
function replayBackControl(type, value) {
    switch (type) {
        case REPLAYBACK_CONTROLS.STOP:
            playBackOptions.switch = true;
            break;
        case REPLAYBACK_CONTROLS.PLAY:
            playBackOptions.switch = false;
            break;
        case REPLAYBACK_CONTROLS.JUMP:                  //跳跃式播放
            //
            break;
        case REPLAYBACK_CONTROLS.SPEED:                 //调整播放速率
            break;
    }
}

/**
 * 时间相关数据查询器 - 
 * @param {String} t - 时间点，格式： YYYYMMDD
 * @param {Array} hourLine - 剩余要查询的小时刻度表
 */
function timeUnionDataQueryBuilder(t, hourLine, countDown) {
    countDown = countDown || playBackOptions.countDown;
    replayBack(countDown, t, hourLine);
}

/**
 * 历史数据追溯
 * @param {Number} countDown - 倒计时时间，单位： 秒
 * @param {String} t - 时间点，格式： YYYYMMDD
 * @param {Array} hourLine - 追溯的小时刻度表
 */
function replayBack(countDown, t, hourLine) {
    if (hourLine.length === 0 || playBackOptions.switch) return;

    playBackOptions.queryTId = setTimeout(function () {
        let h = hourLine.shift();
        replayBack(countDown * (parseInt(h) + 1), t, hourLine);

        //固定点位数据更新
        drawDeviceFixedMarker(districtComboData.currentSelectDistrictId, false, t + h);

        //移动监测点位数据更新
        // drawDeviceMoveMarker(districtComboData.currentSelectDistrictId, false, t + h);

        //国控点位数据更新
        // drawDeviceNationMarker(districtComboData.currentSelectDistrictId, false, t + h);

        //气象数据更新
        getWeatherData(t + h);

        //区域扬尘浓度数据变更
        getDistrictDustAvgsForHourData(t + h);
    }, countDown);
}

/**
 * 时间变更监听器
 * @param {Number} type - 计时器类型
 * @param {Object} tId - 计时器实例
 * @param {Funciton} fn - 要执行的方法
 * @param {Array} extraParams - fn 的动态参数
 */
function timeObserver(type, tId, fn, extraParams) {
    if (tId != void 0) return;
    let D = new Date();
    const _ = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'],
        y = D.getFullYear(),
        m = D.getMonth() + 1,
        d = D.getDate(),
        h = D.getHours(),
        i = D.getMinutes(),
        s = D.getSeconds();

    let targetHour = [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h + 1] || (h + 1), '00', '00'].join(':'),
        targetQHour,
        targetSecondMinInHour = [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h + 1] || (h + 1), '02', '00'].join(':');

    if (i < 15) {
        targetQHour = [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h] || h, '15', '00'].join(':');
    } else if (i > 15 && i < 30) {
        targetQHour = [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h] || h, '30', '00'].join(':');
    } else if (i > 30 && i < 45) {
        targetQHour = [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h] || h, '45', '00'].join(':');
    } else {
        targetQHour = [y, _[m] || m, _[d] || d].join('-') + ' ' + [_[h + 1] || (h + 1), '00', '00'].join(':');
    }


    let targetHourTZ = getFormatDateNew('d', targetHour),
        targetQHourTZ = getFormatDateNew('d', targetQHour),
        targetSecondMinInHourHZ = getFormatDateNew('d', targetSecondMinInHour);


    let timeObserverTId = setInterval(function () {
        let currentTZ = getFormatDateNew('d');
        switch (type) {
            case TIMER_TYPE.T_HOUR:
                //按小时整点执行
                if (currentTZ === targetHourTZ) {
                    clearInterval(timeObserverTId);
                    fn.apply(null, extraParams);

                    tId = setInterval(function () {
                        fn.apply(null, extraParams);
                    }, 60 * 60 * 1000);
                }
                break;
            case TIMER_TYPE.T_QUATTER_HOUR:
                //每15分钟（00， 15， 30，45）时间执行
                if (currentTZ == targetQHourTZ) {
                    clearInterval(timeObserverTId);
                    fn.apply(null, extraParams);

                    tId = setInterval(function () {
                        fn.apply(null, extraParams);
                    }, 15 * 60 * 1000);
                }
                break;
            case TIMER_TYPE.T_SECOND_MIN_IN_HOUR:
                //按小时整点向后延两分钟执行
                if (currentTZ === targetSecondMinInHourHZ) {
                    clearInterval(timeObserverTId);
                    fn.apply(null, extraParams);

                    tId = setInterval(function () {
                        fn.apply(null, extraParams);
                    }, 60 * 60 * 1000);
                }
                break;
        }
    }, 1 * 1000);
}

/**
 * 重新绘制视野内的标注点
 */
function redrawViewMarker() {
    if (currentMapZoom >= 13 && currentMapZoom <= 19) drawDeviceMarkerInView();
}

/**
 * 拖拽视图: 重新绘制视图内的标注点
 */
function drawDeviceMarkerInView() {
    if (devicePointType.points_Fixed.show) {
        Object.values(deviceCrossFixedMarkerList).map(function (device) {
            if (BMapLib.GeoUtils.isPointInRect(device.marker.point, map.getBounds())) {
                if (map.getOverlays().indexOf(device.marker) < 0) {
                    map.addOverlay(device.marker);
                }
            } else {
                map.removeOverlay(device.marker);
            }
        });
    }

    if (devicePointType.points_nation.show) {
        Object.values(deviceNationMarkerList).map(function (device) {
            if (BMapLib.GeoUtils.isPointInRect(device.marker.point, map.getBounds())) {
                if (map.getOverlays().indexOf(device.marker) < 0) {
                    map.addOverlay(device.marker);
                }
            } else {
                map.removeOverlay(device.marker);
            }
        });
    }
}

/**
 * 设备二级标题开关显示与隐藏
 * @param {Number} currentShowIndex - 当前在显示的点位弹窗索引
 * @param {Boolean} ignoreChange - 绕过状态变更
 */
function switchDevicePopTitleShow(currentShowIndex, ignoreChange) {
    switch (currentShowIndex) {
        case -1:
            if (devicePointType.points_Fixed.show) {
                Object.values(deviceCrossFixedMarkerList).map(function (item) {
                    item.infobox.show();
                    item.infobox_dust.hide();
                    return true;
                });
            }
            if (devicePointType.points_nation.show) {
                Object.values(deviceNationMarkerList).map(function (item) {
                    item.infobox.show();
                    item.infobox_aqi.hide();
                    return true;
                });
            }
            if (!ignoreChange) { devicePointType.popShow = [true, false]; }
            break;
        case 0:
            if (devicePointType.points_Fixed.show) {
                Object.values(deviceCrossFixedMarkerList).map(function (item) {
                    item.infobox.hide();
                    item.infobox_dust.show();
                    return true;
                });
            }
            if (devicePointType.points_nation.show) {
                Object.values(deviceNationMarkerList).map(function (item) {
                    item.infobox.hide();
                    item.infobox_aqi.show();
                    return true;
                });
            }
            if (!ignoreChange) { devicePointType.popShow = [false, true]; }
            break;
        case 1:
            if (devicePointType.points_Fixed.show) {
                Object.values(deviceCrossFixedMarkerList).map(function (item) {
                    item.infobox.hide();
                    item.infobox_dust.hide();
                    return true;
                });
            }
            if (devicePointType.points_nation.show) {
                Object.values(deviceNationMarkerList).map(function (item) {
                    item.infobox.hide();
                    item.infobox_aqi.hide();
                    return true;
                });
            }
            if (!ignoreChange) { devicePointType.popShow = [false, false]; }
            break;
    }
}

/**
 * 固定点位设备过滤及标注点
 */
function deviceMarkerFilter() {
    //关闭并销毁已有的弹窗
    if (infoBox_DeviceMarker) {
        infoBox_DeviceMarker.close();
        infoBox_DeviceMarker = null;
    }

    //图例过滤
    renderDeviceStatusStatistic_PieChart();

    deviceCrossFixedMarkerList = {};             //重置过滤后的地图设备标注点

    let statusArr = hiddenLegend.map(function (key) {
        return Object.values(DEVICE_STATUS).filter(function (s) { return s.key === key })[0].status;
    });

    //过滤出有效的设备
    Object.values(deviceFixedMarkerList).map(function (device) {
        if (statusArr.length > 0) {
            if (!statusArr.includes(device.status)) {
                deviceCrossFixedMarkerList[device.devicePoleId] = device;
            } else {
                map.removeOverlay(device.marker);

                device.infobox.hide();
                device.infobox_dust.hide();
            }
        } else {
            deviceCrossFixedMarkerList[device.devicePoleId] = device;
        }
    });

    //绘制视野内有效的设备
    drawDeviceMarkerInView();

    //显示有效的设备的二级标题
    let currentShowIndex = devicePointType.popShow.findIndex(function (show) { return show; });
    switchDevicePopTitleShow(currentShowIndex - 1, true);
}

/**
 * 更新排行的Tab 标题
 * @param {String} v 时间刻度值
 */
function updateRankListTabTitle(v) {
    let prefixTimeStr = '';
    switch (worldTime.currentTimeType) {
        case 3: //年
            prefixTimeStr = worldTime.y + (v !== void 0 ? ('-' + v) : '');
            break;
        case 2: //月
            prefixTimeStr = worldTime.y + '-' + worldTime.m + (v !== void 0 ? ('-' + v) : '');
            break;
        case 1: //日
            prefixTimeStr = worldTime.y + '-' + worldTime.m + '-' + worldTime.d + (v !== void 0 ? (' ' + v + ' 时') : '');
            break;
    }

    $(".box4 .tab li:nth-child(1)").text(prefixTimeStr + ' 最差前十');
    $(".box4 .tab li:nth-child(2)").text(prefixTimeStr + ' 最好前十');
}

/**
 * 设备定位 - 跳转
 * @param {Number} projectId - 站点ID
 */
function dingWei(projectId) {
    hiddenLegend = [];

    let matchedDevice = [];
    matchedDevice = Object.values(deviceFixedMarkerList).filter(function (device) {
        return parseInt(device.projectId) === parseInt(projectId);
    });
    if (!matchedDevice[0]) {
        //重绘当前设备点
        drawDeviceFixedMarker('0', true);
    }

    setTimeout(function () {
        if (matchedDevice[0] === void 0) {
            matchedDevice = Object.values(deviceFixedMarkerList).filter(function (device) {
                return parseInt(device.projectId) === parseInt(projectId);
            });
        }

        if (matchedDevice[0]) {
            var data = deviceFixedMarkerList[matchedDevice[0].devicePoleId];

            if (null !== data) {
                if (infoBox_DeviceMarker) {
                    infoBox_DeviceMarker.close();
                    infoBox_DeviceMarker = null;
                }

                fixedMarkerDescWindowsShow(data, data.marker);
            }
        }
    }, 2 * 1000);
}