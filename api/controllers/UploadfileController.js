module.exports = {
    uploadfile: function (req, res) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
            }
            req.file("file").upload({
                maxBytes: 100000000
            }, function (err, uploadedFiles) {
                if (err) {
                    return res.send(500, err);
                }
                _.each(uploadedFiles, function (n) {
                    var filepath = n.fd;
                    var newfilepath = n.fd;
                    var newfilenamearr = newfilepath.split(".");
                    var extension = newfilenamearr.pop();
                    var mimetype = sails.mime.lookup(n.fd);
                    var newdate = sails.moment(new Date()).format('YYYY-MM-DDh-mm-ss-SSSSa');
                    var filename = 'image' + newdate + '.' + extension;
                    db.open(function (err, db) {
                        var fileId = new sails.ObjectID();
                        var gridStore = new sails.GridStore(db, fileId, filename, 'w', {
                            content_type: mimetype
                        });
                        gridStore.open(function (err, gridStore) {
                            gridStore.writeFile(filepath, function (err, doc) {
                                sails.GridStore.read(db, fileId, function (err, fileData) {
                                    var buffr = fileData;
                                    res.json(fileId);
                                    sails.fs.unlink(filepath, function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },
    getimage: function (req, res) {
        sails.query(function (err, db) {
            if (err) {
                console.log(err);
            }
            var filename = req.param('file');
            var fd = sails.ObjectID(filename);
            var file = new sails.GridStore(db, fd, "r");
            file.open(function (err, file) {
                if (err) {
                    console.log(err);
                }
                res.set('Content-Type', file.contentType);
                var stream = file.stream();
                stream.pipe(res);
            });
        });
    },
    findeach: function (req, res) {

        Uploadfile.findeach(req.body, function (data) {
            Gallery.save(data, function (result) {
                res.json(result);
            });
        });
    },
    createimage: function (req, res) {

        Uploadfile.createimage(req.body, function (data) {
            Gallery.save(data, function (result) {
                res.json(result);
            });
        });
    },
    getfsimage: function (req, res) {
        var filename = req.param('file');
        var path = './images/newimages/' + filename;
        var image = sails.fs.readFileSync(path);
        var mimetype = sails.mime.lookup(path);
        res.set('Content-Type', mimetype);
        res.send(image);
    }
};