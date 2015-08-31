//var lwip = require('lwip');
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
        var file = req.param('file');
        var fd = sails.ObjectID(file);
        var newheight = req.param('height');
        var newwidth = req.param('width');
        if (!newwidth && !newheight) {
            showimage(fd);
        } else if (!newwidth && newheight) {
            newheight = parseInt(newheight);
            findimage(fd, 0, newheight);
        } else if (newwidth && !newheight) {
            newwidth = parseInt(newwidth);
            findimage(fd, newwidth, 0);
        } else {
            findimage(fd, newwidth, newheight);
        }

        function findimage(fd, newwidth, newheight) {
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                }
                sails.GridStore.read(db, fd, function (err, fileData) {
                    width = parseInt(newwidth);
                    height = parseInt(newheight);
                    lwip.open(fileData, 'jpg', function (err, image) {
                        var dimensions = {};
                        dimensions.width = image.width();
                        dimensions.height = image.height();
                        if (width == 0) {
                            width = dimensions.width / dimensions.height * height;
                        }
                        if (height == 0) {
                            height = dimensions.height / dimensions.width * width;
                        }
                        if (err) {
                            console.log(err);
                        }
                        image.resize(width, height, "lanczos", function (err, image2) {
                            db.open(function (err, db) {
                                var fileId = new sails.ObjectID();
                                var mimetype = "image/jpeg";
                                var gridStore = new sails.GridStore(db, fileId, 'w', {
                                    content_type: mimetype
                                });
                                gridStore.open(function (err, gridStore) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    image2.toBuffer("jpg", {}, function (err, imagebuf) {
                                        gridStore.write(imagebuf, function (err, doc) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            if (doc) {
                                                gridStore.close(function () {
                                                    showimage(fileId);
                                                });
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }

        function showimage(oldfile) {
            sails.query(function (err, db) {
                if (err) {
                    console.log(err);
                }
                var filename = oldfile;
                var file = new sails.GridStore(db, filename, "r");
                file.open(function (err, file) {
                    if (err) {
                        console.log(err);
                    }
                    res.set('Content-Type', file.contentType);
                    var stream = file.stream();
                    stream.pipe(res);
                });
            });
        }
    }
};