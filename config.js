const PERMISSION = {                            //权限配置
    weatherPanel: {                             //  - 天气面板
        show: true                              //      - 显示/隐藏 -> 默认： 显示
    },
    deviceFixedStatusPanel: {                   //  - 固定点位状态面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（点击状态点位的过滤事件）
    },
    geoDataPanel: {                             //  - 区域扬尘浓度分布面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true,                            //      - 事件（点击区划的过滤事件）
        dataFilter: false                       //      - 数据过滤（依据系统角色所属的区划做地理数据过滤）
    },
    deviceFilterPanel: {                        //  - 设备选择面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（点击设备类型的过滤事件）
    },
    dateFilterPanel: {                          //  - 日期选择面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（点击设备类型的过滤事件）
    },
    dustTideDataPanel: {                       //  - 扬尘趋势数据展示面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（点击曲线趋势的联动事件）
    },
    dustRankDataPanel: {                       //  - 扬尘排行数据展示面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（鼠标悬停的定位事件）
    },
    historyPlayBackPanel: {                     //  - 点位污染回放面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（日期点击事件）
    },
    deviceMapPanel: {                           //  - 站点地图面板
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true,                            //      - 事件（点击区划的过滤事件）
        dataFilter: false                       //      - 数据过滤（依据系统角色所占有的的设备做过滤）
    },
    videoPlayPanel: {
        show: true,                             //      - 显示/隐藏 -> 默认： 显示
        event: true                             //      - 事件（点击视频按钮的弹窗事件）
    }
};

const ROLE_TYPE = {
    GUEST: {
        id: 1,
        name: "访客"
    },
    ADMIN: {
        id: 2,
        name: "管理员"
    }
}

function matchPermission(roleId) {
    switch (roleId) {
        case ROLE_TYPE.GUEST.id:
            //
            break;
        case ROLE_TYPE.GUEST.ADMIN:
            //
            break;
    }
}