module.exports = {
    save: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.save(req.body, callback);
    },
    delete: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.delete(req.body, callback);
    },
    find: function (req, res) {
        var user = req.param("user");
        if (user && sails.ObjectID.isValid(user)) {
            function callback(data) {
                res.json(data);
            };
            Gallery.find(user, callback);
        } else {
            return res.badRequest();
        }
    },
    findlimited: function (req, res) {
        function callback(data) {
            res.json(data);
        };
        Gallery.findlimited(req.body, callback);
    },
    findone: function (req, res) {
        var gallery = req.param("gallery");
        if (gallery && sails.ObjectID.isValid(gallery)) {
            function callback(data) {
                res.json(data);
            };
            Gallery.findone(gallery, callback);
        } else {
            return res.badRequest();
        }
    }
};