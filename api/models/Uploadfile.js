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
var newimagedata = '';
var canvasdata = '';
var canvaswidth = 1024;
var canvasheight = 768;
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
        sails.lwip.create(canvaswidth, canvasheight, 'white', function (err, canvas) {
            canvasdata = canvas;

            function recimage(num) {
                n = data.image[num];
                if (n.img) {
                    var filepath = './images/' + n.img;
                }
                createdfilename = sails.moment(new Date()).format('YYYY-MM-DDh-mm-ss-SSSSa');
                returns.imagefinal = createdfilename + '.jpg';
                newfilepath = './images/newimages/' + createdfilename + '.jpg';
                imagecreate();

                function imagecreate() {
                    if (filepath != '' && newfilepath != '') {
                        if (canvasdata != "") {
                            sails.lwip.open(filepath, function (err, imagefile) {
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
                                                            newimage.toBuffer('jpg', function (err, buffer) {
                                                                sails.fs.writeFileSync(newfilepath, buffer);
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
                                    });
                                }
                            });
                        }
                    }
                }
            }
            recimage(0);

        });
    }
};