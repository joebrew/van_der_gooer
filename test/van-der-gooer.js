const expect = require('chai').expect
const should = require('chai').should()
const vanDerGoer = require('../van-der-gooer')

describe('Density Based Clustering', function() {
    describe('Geographical distances', function() {
        it('is a finite number', function() {
            expect(vanDerGoer.geographicalDistance({ "lng": 5.2515978518195, "lat": 13.1182789771101 }, { "lng": 5.24215150887217, "lat": 13.064493088185 })).to.be.finite
        })
        it('is a positive number', function() {
            expect(vanDerGoer.geographicalDistance({ "lng": 5.2515978518195, "lat": 13.1182789771101 }, { "lng": 5.24215150887217, "lat": 13.064493088185 })).to.be.not.below(0)
        })
    })

    describe('Neighbourhoods', () => {
        let testSet = [{ lat: 41.3915104, lng: 2.1872686 }, { lat: 41.390872, lng: 2.185977 }, { lat: 41.391077, lng: 2.186229 }]

        it('is an array', function() {
            expect(vanDerGoer.regionQuery(testSet, 0, 200)).to.be.an('array')
        })
        it('is a correct set', function() {
            expect(vanDerGoer.regionQuery(testSet, 0, 200)[1].lat).to.equal(41.390872) && expect(vanDerGoer.regionQuery(testSet, 0, 200)).to.have.lengthOf(3)
        })
        it('does not contain an incorrect set', function() {
            expect(vanDerGoer.regionQuery(testSet, 0, 20)).to.have.lengthOf(1) && expect(vanDerGoer.regionQuery(testSet, 0, 20)[0].lat).to.equal(41.3915104)
        })
        it('should contain only elements from the given set', function() {
            vanDerGoer.regionQuery(testSet, 0, 200)[0].should.be.oneOf(testSet).with.property('lat')
        })
    })

    describe('Expanding the cluster', function() {

    })

    describe('DBSCAN clustering', function() {

    })
})





// vanDerGoer.dbscan(
//     [{ "x": 5.2515978518195, "y": 13.1182789771101, "true_label": "880", "lng": 5.2515978518195, "lat": 13.1182789771101, "label": "880", "correct": true, "optional": true },
//         { "x": 5.24215150887217, "y": 13.064493088185, "true_label": "880", "lng": 5.24215150887217, "lat": 13.064493088185, "label": "880", "correct": true, "optional": true },
//         { "x": 5.24517389783839, "y": 13.0807865667252, "true_label": "880", "lng": 5.24517389783839, "lat": 13.0807865667252, "label": "880", "correct": true, "optional": true },
//         { "x": 5.20507742957126, "y": 13.0693288192475, "true_label": "880", "lng": 5.20507742957126, "lat": 13.0693288192475, "label": "880", "correct": true, "optional": true },
//         { "x": 5.26150717656308, "y": 13.0069578754319, "true_label": "880", "lng": 5.26150717656308, "lat": 13.0069578754319, "label": "880", "correct": true, "optional": true }
//     ],
//     100,
//     2
// )