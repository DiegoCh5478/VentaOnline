'use strict'
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const generateJWT = require('../helpers/create-jwt')