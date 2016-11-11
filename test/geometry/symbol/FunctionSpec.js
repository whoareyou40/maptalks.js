
describe('FunctionTypeSpec', function() {

    var container;
    var map;
    var tile;
    var center = new Z.Coordinate(118.846825, 32.046534);
    var layer;
    var canvasContainer;

    beforeEach(function() {
        var setups = commonSetupMap(center);
        container = setups.container;
        map = setups.map;
        canvasContainer = map._panels.canvasContainer;
        layer = new maptalks.VectorLayer('id').addTo(map);
    });

    afterEach(function() {
        map.removeLayer(layer);
        removeContainer(container);
    });

    function interpolateSymbol(geo, symbol) {
        var result;
        if (Z.Util.isArray(symbol)) {
            result = [];
            for (var i = 0; i < symbol.length; i++) {
                result.push(interpolateSymbol(symbol[i]));
            }
            return result;
        }
        result = {};
        for (var p in symbol) {
            if (symbol.hasOwnProperty(p)) {
                if (Z.Util.isFunctionDefinition(symbol[p])) {
                    if (!geo.getMap()) {
                        result[p] = null;
                    } else {
                        result[p] = Z.Util.interpolated(symbol[p])(geo.getMap().getZoom(), geo.getProperties());
                    }
                } else {
                    result[p] = symbol[p];
                }
            }
        }
        return result;
    }

    it('markerWidth interpolating with zoom', function(done) {
        var marker = new maptalks.Marker([100,0], {
            symbol:{
                "markerFile" : "resources/x.svg",
                "markerWidth": {stops: [[1, 1], [5, 10]]},
                "markerHeight":30
            }
        });
        layer.once('layerload', function() {
            expect(marker.getMap()).to.be.ok();
            expect(marker.getSize().width).to.be.eql(10);
            done();
        });
        layer.addGeometry(marker);
    });

    it('markerWidth interpolating with properties', function(done) {
        var marker = new maptalks.Marker([100,0], {
            symbol:{
                "markerFile" : "resources/x.svg",
                "markerWidth": {property:'foo', stops: [[1, 1], [5, 10], [18,20]]},
                "markerHeight":30
            },
            properties:{
                'foo' : 2
            }
        });
        layer.once('layerload', function() {
            expect(marker.getMap()).to.be.ok();
            expect(marker.getSize().width).to.be.eql(3.25);
            done();
        });
        layer.addGeometry(marker);
    });

    it('markerWidth interpolating with properties', function() {
        var marker = new maptalks.Marker([100,0], {
            symbol:{
                "markerType" : "ellipse",
                "markerWidth": 20,
                "markerHeight":30,
                "markerFill" : {property:'foo', type:'interval', stops: [[1, 'red'], [5, 'blue'], [18,'green']]}
            },
            properties:{
                'foo' : 3
            }
        });
        layer.addGeometry(marker);
        var s = interpolateSymbol(marker, marker.getSymbol());
        expect(s.markerFill).to.be.eql('red');
    });

    it('markerWidth interpolating with non-existed properties', function(done) {
        var marker = new maptalks.Marker([100,0], {
            symbol:{
                "markerFile" : "resources/x.svg",
                "markerWidth": {property:'foo1', stops: [[1, 1], [5, 10], [18,20]]},
                "markerHeight":30
            },
            properties:{
                'foo' : 1
            }
        });
        layer.once('layerload', function() {
            expect(marker.getMap()).to.be.ok();
            expect(marker.getSize().width).to.be.eql(20);
            done();
        });
        layer.addGeometry(marker);
    });

    it('markerWidth interpolating with properties and zoom together', function(done) {
        var marker = new maptalks.Marker([100,0], {
            symbol:{
                "markerFile" : "resources/x.svg",
                "markerWidth": {
                    property:'foo',
                    stops: [
                        [{zoom : 1, value: 1}, 15],
                        [{zoom : map.getZoom(), value: 5}, 18],
                        [{zoom : 18, value: 18},20]
                    ]
                },
                "markerHeight":30
            },
            properties:{
                'foo' : 5
            }
        });
        layer.once('layerload', function() {
            expect(marker.getMap()).to.be.ok();
            expect(marker.getSize().width).to.be.eql(18);
            done();
        });
        layer.addGeometry(marker);
    });

    it('markerWidth without adding on a map', function() {
        var marker = new maptalks.Marker([100,0], {
            symbol:{
                "markerFile" : "resources/x.svg",
                "markerWidth": {stops: [[1, 1], [5, 10]]},
                "markerHeight":30
            }
        });
        var s = interpolateSymbol(marker, marker.getSymbol());
        expect(s.markerWidth).not.to.be.ok();
    });

    it('interpolate a composite symbol', function (done) {
        var marker = new maptalks.Marker([100,0], {
            symbol:[
                {
                    "markerFile" : "resources/x.svg",
                    "markerWidth": {
                        property:'foo',
                        stops: [
                            [{zoom : 1, value: 1}, 15],
                            [{zoom : map.getZoom(), value: 5}, 18],
                            [{zoom : 18, value: 18},20]
                        ]
                    },
                    "markerHeight":30
                },
                {
                    "markerFile" : "resources/x.svg",
                    "markerWidth": 10,
                    "markerHeight":{
                        property:'foo',
                        stops: [
                            [{zoom : 1, value: 1}, 15],
                            [{zoom : map.getZoom(), value: 5}, 40],
                            [{zoom : 18, value: 18},20]
                        ]
                    },
                }

            ],
            properties:{
                'foo' : 5
            }
        });
        layer.once('layerload', function() {
            expect(marker.getMap()).to.be.ok();
            expect(marker.getSize().width).to.be.eql(18);
            expect(marker.getSize().height).to.be.eql(40);
            console.log(marker.getSize())
            done();
        });
        layer.addGeometry(marker);
    });
});
