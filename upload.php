<?php
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Kiểm tra xem tệp đã tồn tại chưa
if (file_exists($target_file)) {
    echo "Xin lỗi, tệp đã tồn tại.";
    $uploadOk = 0;
}

// Kiểm tra kích thước tệp
if ($_FILES["fileToUpload"]["size"] > 500000) {
    echo "Xin lỗi, tệp của bạn quá lớn.";
    $uploadOk = 0;
}

// Cho phép các định dạng tệp nhất định
}

// Kiểm tra xem $uploadOk có được đặt thành 0 do lỗi không
if ($uploadOk == 0) {
    echo "Xin lỗi, tệp của bạn không được tải lên.";
// nếu mọi thứ đều ổn, hãy thử tải tệp lên
} else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        echo "Tệp ". basename( $_FILES["fileToUpload"]["name"]). " đã được tải lên.";
    } else {
        echo "Xin lỗi, đã xảy ra lỗi khi tải lên tệp của bạn.";
    }
}
?>
