/**
 * Uploadfile.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var extension = '';
var returns = {};
var filepath = '';
var createdfilename = '';
var newfilepath = '';
var cropfilepath = '';
var canvasdata = '';
var canvaswidth = 414;
var canvasheight = 736;
var i = 0;
module.exports = {
    findeach: function (data, callback) {
        sails.query(function (err, db) {
            var returns = data;
            sails.lwip.create(canvaswidth, canvasheight, 'white', function (err, canvas) {
                canvasdata = canvas;

                function recimage(num) {
                    n = data.image[num];
                    if (err) {
                        console.log(err);
                    }
                    if (db) {
                        db.collection('image').find({
                            "id": n.id
                        }).toArray(function (err, image) {
                            if (err) {
                                console.log(err);
                                callback({
                                    value: false
                                });
                            }
                            if (image && image != null) {
                                var fd = sails.ObjectID(image[0].imagefs);
                                if (fd && fd != null) {
                                    sails.GridStore.read(db, fd, function (err, fileData) {
                                        var file = new sails.GridStore(db, fd, "r");
                                        file.open(function (err, file) {
                                            if (file) {
                                                filetype = file.contentType;
                                                if (filetype == 'image/jpeg') {
                                                    type = 'jpg';
                                                } else if (filetype == 'image/png') {
                                                    type = 'png';
                                                } else if (filetype == 'image/gif') {
                                                    type = 'gif';
                                                }
                                                imagecreate();
                                            }
                                        });

                                        function imagecreate() {
                                            if (type != '') {
                                                if (canvasdata != "") {
                                                    sails.lwip.open(fileData, type, function (err, imagefile) {
                                                        if (imagefile) {
                                                            imagefile.rotate(n.rotate, function (err, rotateimage) {
                                                                rotateimage.resize(n.width, n.height, function (err, resizedimage) {
                                                                    var cropRight = canvaswidth - n.left - 1;
                                                                    var cropBottom = canvasheight - n.top - 1;
                                                                    resizedimage.crop(0, 0, cropRight, cropBottom, function (err, cropedimage) {
                                                                        newimagedata = cropedimage;
                                                                        canvasdata.paste(n.left, n.top, newimagedata, function (err, newimage) {
                                                                            num++;
                                                                            canvasdata = newimage;
                                                                            if (newimage) {
                                                                                if (num == data.image.length) {
                                                                                    uploadimage(newimage);
                                                                                } else {
                                                                                    recimage(num);
                                                                                }
                                                                            }
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                }

                recimage(0);

                function uploadimage(imagedata) {
                    var fileId = new sails.ObjectID();
                    var mimetype = 'image/gif';
                    var gridStore = new sails.GridStore(db, fileId, 'w', {
                        content_type: mimetype
                    });
                    gridStore.open(function (err, gridStore) {
                        if (err) {
                            console.log(err);
                        }
                        imagedata.toBuffer('gif', {}, function (err, imagebuf) {
                            gridStore.write(imagebuf, function (err, doc) {
                                if (err) {
                                    console.log(err);
                                }
                                if (doc) {
                                    gridStore.close(function () {
                                        returns.imagefnal = fileId;
                                        callback(returns);
                                    });
                                }
                            });
                        });
                    });
                }
            });
        });
    },
    createimage: function (data, callback) {
        returns = data;
        returns.uploadedon = sails.moment(new Date()).format('DD-MM-YYYY');
        sails.lwip.create(canvaswidth, canvasheight, 'white', function (err, canvas) {
            canvasdata = canvas;
            sails.query(function (err, db) {
                if (err) {
                    callback(err);
                    console.log(err);
                }
                if (db) {
                    var user = sails.ObjectID(data.user);
                    db.collection('user').aggregate({
                        $unwind: "$gallery"
                    }, {
                        $match: {
                            "_id": user,
                            "gallery._id": {
                                $exists: true
                            },
                            "gallery.uploadedon": sails.moment(new Date()).format('DD-MM-YYYY')
                        }
                    }, {
                        $project: {
                            "_id": 0,
                            "gallery._id": 1,
                            "gallery.imagefinal": 1
                        }
                    }).toArray(function (err, data2) {
                        if (err) {
                            console.log(err);
                            db.close();
                        } else if (data2 && data2[0]) {
                            returns._id = data2[0].gallery._id;
                            var delimage = data2[0].gallery.imagefinal;
                            var deletepath = './assets/userimage/' + delimage;
                            var splitpath = delimage.split('.');
                            var deletecroppath = './assets/userimage/' + splitpath[0] + '_twitter.jpg';
                            sails.fs.unlink(deletepath, function (err) {
                                if (err) {
                                    console.log(err);
                                }
                                sails.fs.unlink(deletecroppath, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            });
                            recimage(0);
                            db.close();
                        } else {
                            recimage(0);
                            db.close();
                        }
                    });
                }
            });

            function recimage(num) {
                n = data.image[num];
                if (n.img) {
                    var filepath = './images/' + n.img;
                }
                createdfilename = sails.moment(new Date()).format('YYYY-MM-DDh-mm-ss-SSSSa');
                returns.imagefinal = createdfilename + '.jpg';
                newfilepath = './assets/userimage/' + createdfilename + '.jpg';
                cropfilepath = './assets/userimage/' + createdfilename + '_twitter.jpg';

                n.rotate = parseFloat(n.rotate);
                n.width = parseFloat(n.width);
                n.height = parseFloat(n.height);
                n.top = parseFloat(n.top);
                n.left = parseFloat(n.left);
                imagecreate();

                function imagecreate() {
                    if (filepath != '' && newfilepath != '') {
                        if (canvasdata != "") {
                            sails.lwip.open(filepath, function (err, imagefile) {
                                if (err) {
                                    console.log(err);
                                }
                                if (imagefile) {
                                    imagefile.resize(n.width, n.height, function (err, resizedimage) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        var cropRight = 0;
                                        var cropBottom = 0;
                                        var cropTop = 0;
                                        var cropLeft = 0;
                                        if (n.left >= 0) {
                                            cropRight = canvaswidth - n.left - 1;
                                        } else {
                                            cropLeft = (-1 * n.left) + 1;
                                            cropRight = canvaswidth - n.left - 1;
                                            n.left = 0;
                                        }
                                        if (n.top >= 0) {
                                            cropBottom = canvasheight - n.top - 1;
                                        } else {
                                            cropTop = (-1 * n.top) + 1;
                                            cropBottom = canvasheight - n.top - 1;
                                            n.top = 0;
                                        }

                                        resizedimage.crop(parseInt(cropLeft), parseInt(cropTop), parseInt(cropRight), parseInt(cropBottom), function (err, cropedimage) {

                                            if (err) {
                                                console.log(err);
                                            }
                                            canvasdata.paste(n.left, n.top, cropedimage, function (err, newimage) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                num++;
                                                canvasdata = newimage;
                                                if (newimage) {
                                                    if (num == data.image.length) {
                                                        var cropdata = newimage
                                                        newimage.toBuffer('jpg', function (err, buffer) {
                                                            sails.fs.writeFileSync(newfilepath, buffer);
                                                            sails.lwip.open('./images/background/twitter_bg.jpg', function (err, backimage) {
                                                                cropdata.resize(158, 281, function (err, resimage) {
                                                                    backimage.paste(0, 0, resimage, function (err, pastedimage) {
                                                                        pastedimage.toBuffer('jpg', function (err, buffer1) {
                                                                            sails.fs.writeFileSync(cropfilepath, buffer1);
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                            if (createdfilename != "") {
                                                                callback(returns);
                                                            }
                                                        });
                                                    } else {
                                                        recimage(num);
                                                    }
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        }
                    }
                }
            }
        });
    }
};