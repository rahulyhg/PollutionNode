/**
 * DailyPostController
 *
 * @description :: Server-side logic for managing Dailyposts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	  save: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.save(req.body, print);
    },
    find: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.find(req.body, print);
    },
    findlimited: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.findlimited(req.body, print);
    },
    findone: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.findone(req.body, print);
    },
    delete: function (req, res) {
        var print = function (data) {
            res.json(data);
        }
        DailyPost.delete(req.body, print);
    }
};

