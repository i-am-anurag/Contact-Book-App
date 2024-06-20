let mix = require('laravel-mix');

mix
  .js(['./public/js/group.js'],
    './assets/js/admin/group.min.js')
  .js(['./public/js/dashboard.js'],
    './assets/js/admin/dashboard.min.js')
  .js(['./public/js/chats.js'],
    './assets/js/admin/chats.min.js')
//   .styles([
//     'resources/assets/css/all.css',
//     'resources/assets/css/bootstrap.css',
//     'resources/assets/css/theme.css',
//     'resources/assets/css/style.css'
//   ], 'assets/css/common.min.css')