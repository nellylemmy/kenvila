-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 26, 2023 at 11:33 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kenvila`
--

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int(11) NOT NULL,
  `worker_public_id` int(12) NOT NULL,
  `worker_first_name` varchar(50) DEFAULT NULL,
  `worker_last_name` varchar(50) DEFAULT NULL,
  `worker_mobile_number` varchar(30) NOT NULL,
  `worker_email` varchar(200) DEFAULT NULL,
  `worker_password` longtext NOT NULL,
  `Date` date NOT NULL,
  `time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workers`
--

INSERT INTO `workers` (`id`, `worker_public_id`, `worker_first_name`, `worker_last_name`, `worker_mobile_number`, `worker_email`, `worker_password`, `Date`, `time`) VALUES
(199, 752381946, 'Nelson', 'Kilelo', '07123456789', 'nelsonlemmy61@gmail.com', '$2a$12$OBjcn5UPbRlfMfMWBj7qz.jLJvx5/kVp/gBzpFIhKVbCoL9.QCACe', '0000-00-00', '00:00:00'),
(200, 146759238, 'Nelson', 'Lemein', '39838635', 'nelsonlemmy61@gmail.com', '$2a$12$um9Akvxic8e0BxC8LM3hae/AB6BdJ4weMx9CoG7N.1wZ/Mji1Nf76', '0000-00-00', '00:00:00'),
(201, 837642159, 'Nelson', 'Lemein', '0792471415', 'nelsonlemmy61@gmail.com', '$2a$12$hzLDWaPgYQYa2wR2gzAdGezNoTyKklT1WwX6akmwH5JVFhQdeMOtK', '0000-00-00', '00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `worker_transaction_list`
--

CREATE TABLE `worker_transaction_list` (
  `id` int(11) NOT NULL,
  `workers_transactions` varchar(30) NOT NULL,
  `order_tracking_id` varchar(200) DEFAULT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `time` time NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_transaction_list`
--

INSERT INTO `worker_transaction_list` (`id`, `workers_transactions`, `order_tracking_id`, `date`, `time`) VALUES
(11, '39838635', 'c1cfedfc-6121-4e5b-958c-ddc956c8d2fe', '0000-00-00', '00:00:00'),
(12, '07123456789', '12098069-e581-4c6a-8757-ddc9853b2579', '0000-00-00', '00:00:00'),
(13, '07123456789', 'c27287f7-8c20-4d59-8e5a-ddc97215ecba', '2023-12-26', '02:47:58'),
(14, '07123456789', 'ca827ad9-a6da-4ec1-af85-ddc8cdc26a1f', '2023-12-26', '12:46:07'),
(15, '07123456789', '74c6bd76-502c-49ad-af25-ddc8e9bae0ec', '2023-12-26', '21:00:03'),
(16, '07123456789', '6f673efe-72e8-4d8d-9a2a-ddc827221a48', '2023-12-26', '21:10:31'),
(17, '0792471415', '3bf51fd5-defc-4fb3-a78e-ddc89e15df98', '2023-12-26', '21:20:06'),
(18, '0792471415', '5b2fe18d-6438-4582-9a4c-ddc8faaec8cd', '2023-12-26', '22:12:09'),
(19, '0792471415', '37631a72-7c32-4b6b-8c2a-ddc86496fdb0', '2023-12-26', '22:17:29'),
(20, '0792471415', '04b021aa-3a0b-475a-9f86-ddc8c1943b23', '2023-12-26', '22:20:47'),
(21, '0792471415', '3f1108de-e0f6-42db-bca9-ddc8f62bd489', '2023-12-26', '22:44:56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workers_ibfk_1` (`worker_public_id`);

--
-- Indexes for table `worker_transaction_list`
--
ALTER TABLE `worker_transaction_list`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=202;

--
-- AUTO_INCREMENT for table `worker_transaction_list`
--
ALTER TABLE `worker_transaction_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
