const LINE_WIDTH = 4;
const MODEL_URI = "assets/car.glb";
const START_ICON = "assets/start.png";
const PERSON_ICON = "assets/icon.png";
const END_ICON = "assets/end.png";
const ICON_SIZE = 50;
const LINE_COLOR_1 = "#92f10f";
const LINE_COLOR_2 = "#0205fb";
const DURATION = 120000; // 实际时间是依据Cesium时钟
const INTERVAL = 50; // 间隔多少ms取一个点位, 用于更新轨迹颜色

function drawHistory(viewer, positions) {
  const historyLayer = new Cesium.CustomDataSource("historyLayer");
  viewer.dataSources.add(historyLayer);
  // 设置地图视角
  var center = Cesium.Cartesian3.fromDegrees(
    +positions[1].lon,
    +positions[1].lat,
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

  // 画起点
  const startImage = historyLayer.entities.add({
    name: "start",
    position: Cesium.Cartesian3.fromDegrees(
      +positions[0].lon,
      +positions[0].lat
    ),
    billboard: {
      image: START_ICON,
      show: true, // default
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
      width: ICON_SIZE, // default: undefined
      height: ICON_SIZE, // default: undefined
      pixelOffset: new Cesium.Cartesian2(-ICON_SIZE / 2, 0),
    },
  });

  // 画终点
  historyLayer.entities.add({
    name: "end",
    position: Cesium.Cartesian3.fromDegrees(
      +positions[positions.length - 1].lon,
      +positions[positions.length - 1].lat
    ),
    billboard: {
      image: END_ICON,
      show: true, // default
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // default
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER

      width: ICON_SIZE, // default: undefined
      height: ICON_SIZE, // default: undefined
      pixelOffset: new Cesium.Cartesian2(-ICON_SIZE / 2, 0),
    },
  });

  // 设置 PositionProperty
  const property = new Cesium.SampledPositionProperty();
  window.property = property
  property.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
  const startDate = new Date();
  viewer.clock.currentTime = Cesium.JulianDate.fromDate(startDate);
  viewer.clock.canAnimate = true;
  viewer.clock.shouldAnimate = true;



  positions.forEach((item) => {
    const timeout = 1000 * item.delay
    setTimeout(() => {
      console.log(new Date(), item.lon, item.lat);
      const time = Cesium.JulianDate.fromDate(
        new Date(Date.now() + 1000)
      );

      const pos = Cesium.Cartesian3.fromDegrees(+item.lon, +item.lat, 0);
      property.addSample(time, pos);
    }, timeout)




    // const time = Cesium.JulianDate.fromDate(
    //   new Date(Date.now() + 1000 * item.time)
    // );
    // const pos = Cesium.Cartesian3.fromDegrees(+item.lon, +item.lat, 0);
    // property.addSample(time, pos);
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
