const LINE_WIDTH = 4;
const MODEL_URI = "assets/car.glb";
const START_ICON = "assets/start.png";
const PERSON_ICON = "assets/icon.png";
const END_ICON = "assets/end.png";
const ICON_SIZE = 30;
const LINE_COLOR_1 = "#92f10f";
const LINE_COLOR_2 = "#0205fb";
const DURATION = 120000; // 实际时间是依据Cesium时钟
const INTERVAL = 50; // 间隔多少ms取一个点位, 用于更新轨迹颜色

function drawHistory(viewer, positions) {
  const historyLayer = new Cesium.CustomDataSource("historyLayer");
  viewer.dataSources.add(historyLayer);

  // 设置地图视角
  const mid = Math.floor(positions.length/2)
  var center = Cesium.Cartesian3.fromDegrees(
    positions[mid].lon,
    positions[mid].lat,
    5000
  );
  viewer.scene.camera.setView({
    destination: center,
    orientation: {
      heading: Cesium.Math.toRadians(90),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    },
  });

  // 打Lerp点
  let lerpArr = [];
  positions.forEach((item, index) => {
    if (positions[index] && positions[index + 1]) {
      const start = Cesium.Cartesian3.fromDegrees(
        positions[index].lon,
        positions[index].lat
      );
      const end = Cesium.Cartesian3.fromDegrees(
        positions[index + 1].lon,
        positions[index + 1].lat
      );
      lerpArr = lerpArr.concat(getLerpPositions(start, end));
    }
  });
  lerpArr.forEach((item) => {
    historyLayer.entities.add({
      // 设置点的位置
      position: item,
      // 设置点的样式
      point: {
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 0,
        pixelSize: 4, // 点的大小
        color: Cesium.Color.ORANGE, // 点的颜色
      },
    });
  });

  // 打原始点
  positions.forEach((item) => {
    historyLayer.entities.add({
      // 设置点的位置
      position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 0.01),
      // 设置点的样式
      point: {
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        pixelSize: 6, // 点的大小
        color: Cesium.Color.RED, // 点的颜色
      },
    });
  });

  // 设置 SampledPositionProperty
  const property = new Cesium.SampledPositionProperty();
  property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
  const startDate = new Date();
  viewer.clock.currentTime = Cesium.JulianDate.fromDate(startDate);
  viewer.clock.canAnimate = true;
  viewer.clock.shouldAnimate = true;
  positions.forEach((item, index) => {
    // 设置初始位置
    if (index === 0) {
      const time = Cesium.JulianDate.fromDate(new Date(Date.now()));
      const pos = Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 0);
      property.addSample(time, pos);
    }

    const timeout = 1000 * item.delay;
    setTimeout(() => {
      console.log(new Date(), item.lon, item.lat);
      const time = Cesium.JulianDate.fromDate(new Date(Date.now() + 2000));

      const pos = Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 0);
      property.addSample(time, pos);
    }, timeout);
  });

  const person = historyLayer.entities.add({
    name: "person",
    position: property,
    billboard: {
      image: PERSON_ICON,
      show: true, // default
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
      width: ICON_SIZE, // default: undefined
      height: ICON_SIZE, // default: undefined
      pixelOffset: new Cesium.Cartesian2(-ICON_SIZE / 2, 0),
    },
  });

  // // 汽车模型
  // const car = historyLayer.entities.add({
  //   position: property,
  //   model: {
  //     uri: MODEL_URI,
  //     scale: 0.5,
  //     minimumPixelSize: 64,
  //   },
  //   orientation: new Cesium.VelocityOrientationProperty(property),
  // });
}

// 将2个点密集成多个点 (points)
function getLerpPositions(start, end) {
  const points = 83;
  const result = [];
  for (let i = 0; i < points; i++) {
    result.push(
      Cesium.Cartesian3.lerp(
        start,
        end,
        i / (points - 1),
        new Cesium.Cartesian3()
      )
    );
  }
  return result;
}
