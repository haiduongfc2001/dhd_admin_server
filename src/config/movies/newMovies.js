// import module 'fs' để làm việc với file system
const fs = require('fs');

// Đọc nội dung của file dataMovie.json và lưu vào biến dataMovie
const dataMovie = require('../dataMovie.json');

// Lọc những bộ phim có 'release_date' từ 2010 đến nay
// Tạo 1 biến newMovies và gán cho nó kết quả của việc lọc dữ liệu trong mảng dataMovie
const newMovies = dataMovie.filter(movie => {
    // truy cập 'release_date' của movie rồi sử dụng phương thức slide(0, 4)
    // để cắt chuỗi từ vị trí 0 đến 3
    // tiếp theo sử dụng parseInt để chuyển đổi chuỗi số sang kiểu dữ lệu số nguyên
    const releaseYear = parseInt(movie.release_date.slice(0, 4));
    return releaseYear >= 2010;
});

// Chuyển đổi phim đã lọc thành chuỗi JSON
const newMoviesJSON = JSON.stringify(newMovies, null, 2);
// Chuyển đổi mảng newMovies thành chuỗi JSON bằng cách sử dụng JSON.stringify().
// 'null' được sử dụng để loại bỏ các thuộc tính undefined
// '2' chỉ định ký tự dấu cách để định dạng đầu ra dễ đọc.

// Ghi JSON phim đã lọc vào file
fs.writeFile('newMovies.json', newMoviesJSON, err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Filtered movies JSON file created successfully!');
    }
})