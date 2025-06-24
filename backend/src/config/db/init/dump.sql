INSERT INTO users (id, email, role,firebase_uid) VALUES
('5e967e16-0b2a-415c-8ac0-bf811452149a', 'abc@gmail.com','user','wxLs1fRSr1hSJoXDmOYaKUGyBxl2');


INSERT INTO user_profiles (id, user_id, full_name, profile_picture_url, date_of_birth, gender, country, occupation) VALUES
('1dc560a5-5621-485d-b3a8-cf4046e3c4c9', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Chad Anderson', 'https://placeimg.com/551/1012/any', '1989-04-24', 'Female', 'Bosnia and Herzegovina', 'Psychiatrist');



INSERT INTO category (id, name, icon_url, type, parent_id) VALUES
('df684eb1-0f8e-4a81-a5af-a75120b49736', 'Car', 'https://placeimg.com/639/142/any', 'income', NULL),
('e46d61d1-6f3f-46e1-aa50-da22620be7ed', 'Such', 'https://placeimg.com/492/421/any', 'income', NULL),
('8a7f290b-6f65-4b75-acc4-059517791551', 'Positive', 'https://www.lorempixel.com/379/940', 'expense', NULL),
('593ca629-934d-42b0-8a73-19b9a75e90de', 'Teach', 'https://www.lorempixel.com/833/829', 'income', NULL),
('606cd162-51ef-4be4-9056-7b0c9557b16d', 'Of', 'https://www.lorempixel.com/420/392', 'income', NULL),
('c3d9bd4e-4447-4c57-9a9f-da08ac1b5b8f', 'Buy', 'https://www.lorempixel.com/224/842', 'expense', '8a7f290b-6f65-4b75-acc4-059517791551'),
('8fe3c1ff-ceef-4800-bcc1-faa011aa4e80', 'Cold', 'https://placeimg.com/526/668/any', 'expense', '606cd162-51ef-4be4-9056-7b0c9557b16d'),
('7055278a-1d91-41b4-9af6-5acc8f402216', 'Want', 'https://placekitten.com/362/780', 'income', '593ca629-934d-42b0-8a73-19b9a75e90de'),
('6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'Hear', 'https://dummyimage.com/103x126', 'income', '8a7f290b-6f65-4b75-acc4-059517791551'),
('2fa2f370-6f31-45f3-b477-e73504fd8707', 'Evening', 'https://www.lorempixel.com/43/963', 'income', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed'),
('2f519cc7-e8a3-4981-8f59-de2b1be0d954', 'Organization', 'https://www.lorempixel.com/575/121', 'expense', 'df684eb1-0f8e-4a81-a5af-a75120b49736'),
('90e272ee-6e73-40d3-9ee1-12e2b9bf0ee5', 'Wife', 'https://placeimg.com/879/207/any', 'expense', '606cd162-51ef-4be4-9056-7b0c9557b16d'),
('1b4dc198-8063-4048-9c93-5670c0519e8d', 'Improve', 'https://dummyimage.com/417x980', 'expense', '8a7f290b-6f65-4b75-acc4-059517791551'),
('504fbfa1-5b4e-418e-af15-ab9acd57fa07', 'Sound', 'https://placekitten.com/677/388', 'expense', '8a7f290b-6f65-4b75-acc4-059517791551'),
('39bc7f9c-c31e-489d-acd3-ea310a936c39', 'Because', 'https://dummyimage.com/969x881', 'expense', '593ca629-934d-42b0-8a73-19b9a75e90de'),
('fdd34267-1bc9-49a0-b96c-4352a508aa18', 'Adult', 'https://dummyimage.com/9x769', 'expense', '606cd162-51ef-4be4-9056-7b0c9557b16d'),
('1fba21de-b0bc-4b9b-942c-6b0dba341306', 'True', 'https://dummyimage.com/712x905', 'expense', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed'),
('cd758493-e054-45f2-8c06-5e540b78d36d', 'Bill', 'https://dummyimage.com/774x638', 'expense', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed'),
('f61c5623-7b2a-4a2b-b9b6-d9af4326b94b', 'Capital', 'https://dummyimage.com/818x422', 'income', 'df684eb1-0f8e-4a81-a5af-a75120b49736'),
('7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'Among', 'https://placekitten.com/923/980', 'income', '593ca629-934d-42b0-8a73-19b9a75e90de');

INSERT INTO event (id, name, note, start_date, end_date) VALUES
('6f5351ff-b5e0-4a0f-ad2a-fc38294c63a1', 'Monitored local structure', 'Relationship evening somebody his task send.', '2025-01-04', '2025-01-30'),
('2d8526de-14a1-452d-9822-3ae713925759', 'Profound contextually-based encryption', 'Final story pass.', '2025-01-08', '2025-01-30'),
('9243ccc9-609d-4076-b11d-82a12e3f2a5d', 'Face-to-face well-modulated concept', 'Day member so.', '2025-04-28', '2025-07-16'),
('4ffadfd2-b4ce-44b4-b36c-72cd0f3cabbb', 'Face-to-face solution-oriented approach', 'Grow our mind class.', '2025-01-06', '2025-02-16'),
('07cc863e-97f3-494a-8e2c-c73e74f8389c', 'Open-source global complexity', 'Nature crime show green lose author into.', '2025-06-07', '2025-07-14'),
('7fbd0a8b-e200-4deb-a2cf-bb75008ac530', 'Centralized content-based architecture', 'Begin hotel protect situation example.', '2025-06-14', '2025-06-15'),
('608ce19e-7235-4f5d-b572-eadc39eeb96e', 'Fundamental 3rdgeneration access', 'Account attorney in article positive inside fight.', '2025-04-18', '2025-05-25'),
('bda4921f-bdfa-4565-b191-99e4e56c8ab5', 'Managed impactful success', 'Stay song energy mention where final fill.', '2025-05-17', '2025-05-26'),
('9f52b247-e2f3-4235-84c5-06150cf34374', 'Self-enabling demand-driven hardware', 'Realize front air decision figure suffer laugh.', '2025-03-03', '2025-06-05'),
('a5934ecd-e56c-4242-b61b-a1ebf54ad123', 'Visionary systemic success', 'Movement tough method Mr up success science.', '2025-03-13', '2025-06-18'),
('b59cdd86-8056-41cf-9a53-4c67280b6359', 'Triple-buffered fault-tolerant Graphical User Interface', 'Single fight form something often.', '2025-05-04', '2025-05-29'),
('5da93258-b33c-4916-a534-c54b8ba44d8d', 'Synergized multi-tasking monitoring', 'Even last side child particularly.', '2025-06-02', '2025-06-25'),
('442e138a-3643-4e91-9908-49147d5978c7', 'Exclusive transitional monitoring', 'Fast until different house woman not.', '2025-01-11', '2025-05-05'),
('2e2ac691-7f41-408a-8ded-ec64c4422946', 'Multi-tiered well-modulated website', 'Discover more discuss his southern.', '2025-03-12', '2025-05-25'),
('db34f47f-b975-4f0b-936e-0a475afc0dcd', 'Distributed incremental Graphical User Interface', 'Through they thus like always red.', '2025-03-03', '2025-07-16'),
('644c86a6-8161-4af8-b51f-35a45eec8f37', 'Upgradable maximized ability', 'Democrat such first look scientist.', '2025-06-03', '2025-06-10'),
('c93573c2-68d1-4640-adb5-552e19cc3749', 'Optimized national archive', 'Remember rich scene avoid shoulder sound.', '2025-06-01', '2025-06-09'),
('d054b68e-c521-4686-8191-000e5f57b067', 'Diverse user-facing hierarchy', 'Between past pattern go voice deep specific our.', '2025-03-18', '2025-06-11'),
('26286c41-9ed1-4d43-94f8-583aac592473', 'Sharable explicit collaboration', 'Trade successful watch.', '2025-06-10', '2025-06-28'),
('de941895-6b60-43ad-9ef1-7658d899a5da', 'Adaptive modular extranet', 'Next color top listen special trade hotel.', '2025-02-16', '2025-06-09');

INSERT INTO transaction (id, user_id, amount, date, description, category_id, type, event_id, recurrence, confirmed) VALUES
('3b385a7e-1c41-43b1-b835-dfe37a5b6bd3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 1907.58, '2025-05-14', 'Fish discussion grow federal someone response four.', '1fba21de-b0bc-4b9b-942c-6b0dba341306', 'income', '2d8526de-14a1-452d-9822-3ae713925759', False, True),
('26ce6f3e-90ca-45da-8221-e47da141586e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2401.65, '2025-05-05', 'Easy color important compare hair trial.', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'income', 'd054b68e-c521-4686-8191-000e5f57b067', True, True),
('2ed87926-6c74-474a-aa91-960acde071c0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3122.57, '2025-05-13', 'Paper too son act full short.', '2f519cc7-e8a3-4981-8f59-de2b1be0d954', 'income', '6f5351ff-b5e0-4a0f-ad2a-fc38294c63a1', True, True),
('171bcc24-11d8-4b82-9ee8-e893abc43e4e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3935.36, '2025-03-13', 'Participant necessary involve manage too.', 'fdd34267-1bc9-49a0-b96c-4352a508aa18', 'income', 'de941895-6b60-43ad-9ef1-7658d899a5da', True, True),
('faceb13e-484f-41a6-a6c4-40d8e6c6375f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2044.73, '2025-01-22', 'We spring impact data rich hundred ready.', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', False, True),
('2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4241.29, '2025-03-04', 'Section increase make face.', 'df684eb1-0f8e-4a81-a5af-a75120b49736', 'income', '26286c41-9ed1-4d43-94f8-583aac592473', True, True),
('0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4480.41, '2025-04-29', 'East sign resource candidate policy.', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'expense', '26286c41-9ed1-4d43-94f8-583aac592473', False, True),
('7e556290-6f17-4638-887b-839e48791c23', '5e967e16-0b2a-415c-8ac0-bf811452149a', 1903.09, '2025-03-29', 'Firm race instead.', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'expense', '2e2ac691-7f41-408a-8ded-ec64c4422946', True, True),
('67567550-5e11-4b66-af88-8f4dc5fe50c5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 142.78, '2025-02-05', 'History short assume training development example model up.', '504fbfa1-5b4e-418e-af15-ab9acd57fa07', 'income', 'db34f47f-b975-4f0b-936e-0a475afc0dcd', False, True),
('eb04d115-d394-411d-81e9-48bada65c8e9', '5e967e16-0b2a-415c-8ac0-bf811452149a', 877.01, '2025-01-18', 'Pull build write cell member down whatever central.', '2f519cc7-e8a3-4981-8f59-de2b1be0d954', 'income', '608ce19e-7235-4f5d-b572-eadc39eeb96e', False, True),
('65a5a7de-5658-4db8-8d3f-c31d04f1f1f7', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3169.77, '2025-01-08', 'Performance its huge development author herself.', '593ca629-934d-42b0-8a73-19b9a75e90de', 'expense', 'b59cdd86-8056-41cf-9a53-4c67280b6359', True, True),
('a5f6551c-775a-45db-b4b8-e94b080c9e4e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2709.98, '2025-04-30', 'Course or actually third activity success.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'income', '608ce19e-7235-4f5d-b572-eadc39eeb96e', False, True),
('48e09c77-f59c-4730-afde-db4f4080e372', '5e967e16-0b2a-415c-8ac0-bf811452149a', 1527.39, '2025-01-04', 'Capital couple event wife treatment message.', 'cd758493-e054-45f2-8c06-5e540b78d36d', 'income', '6f5351ff-b5e0-4a0f-ad2a-fc38294c63a1', True, True),
('d70c0eb2-3771-44f6-82ce-b86978708a47', '5e967e16-0b2a-415c-8ac0-bf811452149a', 650.41, '2025-01-15', 'Nor stay in.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'expense', '9243ccc9-609d-4076-b11d-82a12e3f2a5d', True, True),
('79c8961f-94bd-4081-bbe1-673af18a0c26', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3150.95, '2025-04-21', 'Republican development activity month happy.', '504fbfa1-5b4e-418e-af15-ab9acd57fa07', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', True, True),
('34d44c61-ccc3-4af0-8851-8da713b0071d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4322.32, '2025-05-06', 'Challenge remember success ahead quickly myself.', '39bc7f9c-c31e-489d-acd3-ea310a936c39', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', False, True),
('61e67cc1-4342-4b47-abe9-49846c3285a7', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2771.42, '2025-02-23', 'Partner radio ten window.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'expense', '9f52b247-e2f3-4235-84c5-06150cf34374', False, True),
('679d38f0-6ebf-4b4d-9748-63bdf4c72402', '5e967e16-0b2a-415c-8ac0-bf811452149a', 303.34, '2025-05-20', 'Support decade charge.', '7055278a-1d91-41b4-9af6-5acc8f402216', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', False, True),
('ea5569db-da3d-42b9-a689-10d41515419d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4689.63, '2025-04-29', 'Member read within surface major.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'income', '26286c41-9ed1-4d43-94f8-583aac592473', True, True),
('2f95db51-02c4-4574-8411-fad0e7da695f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 197.86, '2025-02-13', 'West interesting Republican today.', '606cd162-51ef-4be4-9056-7b0c9557b16d', 'expense', '5da93258-b33c-4916-a534-c54b8ba44d8d', True, True);

INSERT INTO debt (id, user_id, description, type, start_date, expiration_date, interest_rate, amount, taken_from) VALUES
('0702e4aa-ff96-4dcc-8656-bfef5fbf9131', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Scientist foot song somebody way sign garden energy.', 'personal', '2025-05-08', '2026-03-04', 7.63, 14092.76, 'Navarro, Brown and Rice'),
('217abb92-b8ce-4528-b4a9-196a814c1d70', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Financial page network month relationship organization news.', 'bank', '2025-02-28', '2025-09-10', 2.18, 18855.73, 'Hart, Alexander and Deleon'),
('ec62f988-d86d-4bf2-86aa-b51428486606', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Sister team interesting.', 'personal', '2025-06-08', '2026-03-10', 8.2, 10800.7, 'Sullivan Group'),
('ece01dd7-3a00-4d0b-97a4-4fdc6fae3bc8', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Rate evening allow difference before case house.', 'bank', '2025-02-15', '2025-09-16', 5.9, 16220.11, 'Jordan, Hicks and Pena'),
('962f4f6d-ec6b-4c45-8a1a-47f03f799aba', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Foot sell certainly customer head million.', 'bank', '2025-05-28', '2026-03-25', 8.64, 10968.32, 'Russell, Ray and Strong'),
('bd408e08-23fd-4e5d-8ed4-d959d1748fa6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Pick throughout individual western high.', 'bank', '2025-05-18', '2025-12-21', 8.43, 13927.92, 'Hansen Group'),
('bea5f45a-e5eb-4fb1-adb5-c9ca4f481990', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Exactly ask deal join.', 'personal', '2025-02-07', '2025-11-23', 5.15, 11710.4, 'Hudson, Hall and Smith'),
('75f2bceb-c217-4f42-96f0-54cd12f1a319', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Customer about four successful.', 'bank', '2025-05-29', '2026-04-19', 5.89, 9365.19, 'Tanner, Pierce and West'),
('dca22eb7-b5a0-4ed9-a5e9-7e89c9bad7c2', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Forget catch foot.', 'personal', '2025-03-23', '2025-09-08', 1.28, 9817.37, 'Tran, Johnson and Harrison'),
('88db0300-c978-4e8a-ab28-0825e2a66ba5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Country would season care apply community.', 'bank', '2025-01-31', '2025-07-23', 8.16, 8383.33, 'Mcknight-Melendez'),
('4e71a3ad-862d-4293-aef0-250795c958c4', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Chair strong shake character fire source.', 'personal', '2025-05-07', '2025-07-28', 4.05, 13792.37, 'Fischer Ltd'),
('72a046c5-2c54-4cc5-82ef-9a741bc645b1', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Tv Congress task tree garden throughout.', 'personal', '2025-01-16', '2026-01-25', 5.71, 14997.57, 'Elliott-Graham'),
('f62774c4-da23-4d6b-87b3-a69543c5e633', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Than election single indeed.', 'personal', '2025-02-27', '2025-10-14', 5.2, 16087.63, 'Atkins, Garcia and Shields'),
('0d767057-289c-43e3-90db-3bbb8e08dfff', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Arrive major really science yet.', 'bank', '2025-02-09', '2025-10-05', 4.96, 9716.47, 'Morris, Frey and Hunter'),
('31efe4f0-7609-4f9a-aac6-516cf63761b0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Soldier laugh step require charge toward bit speech.', 'personal', '2025-05-13', '2026-03-06', 8.9, 4705.11, 'Lewis, Meyers and Gordon'),
('457c182e-f7b7-43f0-9bc0-3b4a726a0e16', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Certainly since development same add behavior south.', 'bank', '2025-05-19', '2026-02-06', 3.89, 6592.85, 'Curry, Harvey and Bowman'),
('c71c2bf8-5853-4c79-9874-c4125465af3d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Produce politics season citizen writer.', 'bank', '2025-01-06', '2026-04-05', 5.22, 12796.23, 'Henderson PLC'),
('93db05a7-68ee-400c-a729-531b51da62a0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Back bed least third.', 'personal', '2025-01-17', '2025-12-13', 8.82, 8868.08, 'Miller-Johnson'),
('b2584a85-b2fb-4d86-a436-1a2b57b3d587', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Charge morning may bank full sense role company.', 'personal', '2025-03-11', '2026-05-19', 4.52, 5597.15, 'Joyce, Webb and Riddle'),
('fa739330-29f2-4e49-944b-64f947dd8f96', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Machine despite picture health nothing.', 'bank', '2025-06-22', '2026-01-20', 5.62, 11064.87, 'Palmer, Bernard and Mitchell');

INSERT INTO saving (id, user_id, description, start_amount, target_amount, start_date, end_date, expired, completed) VALUES
('ee2cc58b-54ce-4a5e-8fca-92e9ca4e199a', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Once attack stop same agree imagine.', 2727.54, 5313.6900000000005, '2025-04-09', '2026-03-04', True, True),
('a4fc8ef0-fff2-4c51-8a72-011090438fb3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Treat sell others.', 7010.02, 14998.92, '2025-01-06', '2025-05-03', False, True),
('af46e5e7-5061-4c0c-a202-ad86ec5f9c03', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Feeling particular senior money.', 203.75, 4101.42, '2025-03-09', '2026-04-22', False, False),
('71f5bcaf-e4c0-4c52-a00d-098bd0dc9b68', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Smile wrong similar against.', 1235.55, 2750.29, '2025-05-18', '2026-02-01', True, True),
('7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Beyond in trade how.', 4703.28, 8811.64, '2025-01-19', '2025-06-27', True, False),
('edb07a69-cd2a-49c0-88cd-3cdedbe543a3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Central why friend situation bit concern.', 5972.0, 7243.34, '2025-03-03', '2025-04-19', True, False),
('1c38a5bc-5ad3-455b-b5f4-c75d43bd8cf0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Respond any include where.', 9590.31, 18432.3, '2025-01-09', '2026-02-20', False, False),
('10a5f062-fa2b-4dba-a533-40dc26e3527e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Open huge bring.', 8392.52, 10473.67, '2025-06-22', '2025-10-20', True, False),
('a37a3e3f-3e38-47c2-85ff-41e60804d95d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Staff radio imagine leg near film.', 410.46, 7094.44, '2025-06-10', '2025-06-28', False, False),
('630a64fb-2f8f-4508-af0a-45ca4aee5866', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Information piece town treatment us again blood.', 2162.08, 4257.45, '2025-06-11', '2025-08-23', False, True),
('71985b91-93e5-4eba-a192-18bcfd176f7b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Beautiful itself cover partner early concern church son.', 3359.26, 10132.74, '2025-01-26', '2026-01-06', True, True),
('73f79725-b1e5-4e82-a1b8-0e0575e681b0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Newspaper determine business spend speech quality current.', 1199.06, 8333.57, '2025-03-04', '2026-06-21', False, True),
('9768b97e-eb73-49bd-8247-cc7c8a7c0a5d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Away remember on artist might feel hot.', 2455.44, 7124.960000000001, '2025-04-21', '2026-05-06', False, False),
('0f64398e-664b-4988-85ae-e4bb5abf37d4', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Think give role red.', 2058.22, 8848.58, '2025-06-17', '2025-11-26', True, True),
('59414c41-783a-4e1d-910f-de8ee4f5d1da', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'General conference town new fly indicate.', 6829.73, 14696.07, '2025-02-25', '2025-10-07', False, False),
('cd36ca1b-e1ef-4074-af2c-4e0a18073575', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Message both instead.', 7915.27, 10440.59, '2025-01-27', '2025-08-13', False, True),
('86bbe903-23f2-48f3-99ef-5047a2ed4114', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Mind risk good reveal mouth around election event.', 7557.14, 10986.970000000001, '2025-04-27', '2026-03-13', True, True),
('972e2887-af93-493d-913e-fe3f340a6035', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Specific main agreement various ability.', 1919.72, 3414.5, '2025-02-01', '2026-03-24', False, True),
('065880ce-4976-4b68-87c1-cf5977814d10', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Responsibility several attack word break against blue.', 2969.62, 8832.32, '2025-05-01', '2025-10-05', False, True),
('ec6bd520-21b5-4ea5-a090-e87a6be02954', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Decide hot good somebody partner.', 4107.93, 5403.83, '2025-03-28', '2025-06-08', False, False);

INSERT INTO budget (id, user_id, category_id, start_date, end_date, goal_amount, expired, amount_exceeded, icon_url) VALUES
('24a850b8-0044-4da3-a418-24394c72005d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'c3d9bd4e-4447-4c57-9a9f-da08ac1b5b8f', '2025-04-10', '2025-09-07', 4478.67, False, False, 'https://www.lorempixel.com/993/336'),
('62ce96de-2ec1-477e-8f87-0cf57cea0cf8', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'cd758493-e054-45f2-8c06-5e540b78d36d', '2025-05-10', '2025-05-29', 1704.4, True, False, 'https://placekitten.com/109/129'),
('38b6d8eb-89f9-4ef2-984f-0da36e3345b1', '5e967e16-0b2a-415c-8ac0-bf811452149a', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', '2025-06-12', '2025-08-08', 4730.44, True, True, 'https://placeimg.com/968/137/any'),
('f09e21a5-fc5f-4ddf-a728-d5fc59adcc55', '5e967e16-0b2a-415c-8ac0-bf811452149a', '39bc7f9c-c31e-489d-acd3-ea310a936c39', '2025-05-18', '2025-06-22', 4414.44, True, True, 'https://dummyimage.com/771x729'),
('22d2e17f-179c-4170-8114-1963def5db15', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2f519cc7-e8a3-4981-8f59-de2b1be0d954', '2025-05-18', '2025-08-02', 4503.46, True, False, 'https://dummyimage.com/421x144'),
('24f7ba9a-a82c-44cb-9a8f-45ce8a30b028', '5e967e16-0b2a-415c-8ac0-bf811452149a', '504fbfa1-5b4e-418e-af15-ab9acd57fa07', '2025-03-24', '2025-09-16', 1812.39, False, False, 'https://placekitten.com/349/465'),
('8045bdef-2e24-4398-9d92-4bf30b6840d9', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2fa2f370-6f31-45f3-b477-e73504fd8707', '2025-04-14', '2025-05-29', 1593.43, False, True, 'https://www.lorempixel.com/205/865'),
('9d4068db-a226-4f2f-b336-d3174728e835', '5e967e16-0b2a-415c-8ac0-bf811452149a', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', '2025-01-28', '2025-07-12', 4733.53, True, True, 'https://placekitten.com/691/936'),
('62d491ed-2ffd-497e-999d-ecd8dd5c4da9', '5e967e16-0b2a-415c-8ac0-bf811452149a', '8fe3c1ff-ceef-4800-bcc1-faa011aa4e80', '2025-02-17', '2025-04-25', 4672.77, True, False, 'https://www.lorempixel.com/344/543'),
('81a3b40b-bade-498c-80c5-00a49f8efafa', '5e967e16-0b2a-415c-8ac0-bf811452149a', '1b4dc198-8063-4048-9c93-5670c0519e8d', '2025-01-21', '2025-05-04', 1670.15, False, False, 'https://dummyimage.com/542x875'),
('030d7158-ce7c-4c0e-a8b1-94c310fdc5d6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'fdd34267-1bc9-49a0-b96c-4352a508aa18', '2025-01-09', '2025-05-28', 3857.58, True, True, 'https://placekitten.com/664/227'),
('20d5ca6a-2292-467d-a943-5b4f1f92ee9f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed', '2025-02-19', '2025-02-19', 4829.36, True, False, 'https://placeimg.com/653/189/any'),
('a714226d-68a2-4426-a16a-7b7561acdee5', '5e967e16-0b2a-415c-8ac0-bf811452149a', '606cd162-51ef-4be4-9056-7b0c9557b16d', '2025-05-28', '2025-09-02', 2886.09, True, False, 'https://placeimg.com/414/653/any'),
('5fffb1f6-9e09-4f1d-80a3-70471dd1ef79', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'df684eb1-0f8e-4a81-a5af-a75120b49736', '2025-05-21', '2025-06-30', 1808.15, False, False, 'https://www.lorempixel.com/963/704'),
('3ee73d42-cd6a-43f9-a2c1-861bec979cbf', '5e967e16-0b2a-415c-8ac0-bf811452149a', '593ca629-934d-42b0-8a73-19b9a75e90de', '2025-04-14', '2025-08-30', 509.81, False, True, 'https://www.lorempixel.com/47/712'),
('21862502-dee8-4ad2-8e56-3f471a2ed99e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'f61c5623-7b2a-4a2b-b9b6-d9af4326b94b', '2025-05-07', '2025-06-16', 4544.19, False, True, 'https://placekitten.com/11/101'),
('8f102ff3-965f-4991-b0e0-4eaa434635a2', '5e967e16-0b2a-415c-8ac0-bf811452149a', '7055278a-1d91-41b4-9af6-5acc8f402216', '2025-05-03', '2025-08-03', 4599.38, False, False, 'https://placekitten.com/29/495'),
('21c1d458-e116-4cf8-85b7-2a50716d269b', '5e967e16-0b2a-415c-8ac0-bf811452149a', '8a7f290b-6f65-4b75-acc4-059517791551', '2025-05-13', '2025-05-27', 3117.55, True, True, 'https://dummyimage.com/82x15'),
('80812bdb-5349-4bee-98c6-fb3c72cc50d9', '5e967e16-0b2a-415c-8ac0-bf811452149a', '90e272ee-6e73-40d3-9ee1-12e2b9bf0ee5', '2025-05-23', '2025-06-07', 4057.0, True, True, 'https://placekitten.com/590/933'),
('8c7bd554-06e8-4aa3-90cd-ccfb18419f26', '5e967e16-0b2a-415c-8ac0-bf811452149a', '1fba21de-b0bc-4b9b-942c-6b0dba341306', '2025-03-30', '2025-05-17', 4894.95, False, True, 'https://placeimg.com/780/837/any');

INSERT INTO transfer (id, user_id, description, date, from_income_id, from_saving_id, to_debt_id, to_savings_id, to_expense_id, amount) VALUES
('2a1058e7-4815-41bc-afe3-b0ffd92da09a', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Level couple use almost understand near after.', '2025-01-20', 'ea5569db-da3d-42b9-a689-10d41515419d', '7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', '93db05a7-68ee-400c-a729-531b51da62a0', '9768b97e-eb73-49bd-8247-cc7c8a7c0a5d', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', 241.38),
('2b425133-ef00-4e65-88c5-2eff2a143bdf', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Get and market back clearly report.', '2025-04-01', 'eb04d115-d394-411d-81e9-48bada65c8e9', '73f79725-b1e5-4e82-a1b8-0e0575e681b0', 'c71c2bf8-5853-4c79-9874-c4125465af3d', '972e2887-af93-493d-913e-fe3f340a6035', '79c8961f-94bd-4081-bbe1-673af18a0c26', 167.89),
('35f645e0-bb1a-4f25-8554-24957e01afdd', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Whether certainly card than how since.', '2025-06-01', '2ed87926-6c74-474a-aa91-960acde071c0', '9768b97e-eb73-49bd-8247-cc7c8a7c0a5d', '75f2bceb-c217-4f42-96f0-54cd12f1a319', '7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', 'faceb13e-484f-41a6-a6c4-40d8e6c6375f', 806.68),
('f7eb4b33-6012-4b9d-a9a0-a86473eacb27', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Goal visit whole church institution.', '2025-01-31', '2ed87926-6c74-474a-aa91-960acde071c0', '73f79725-b1e5-4e82-a1b8-0e0575e681b0', 'b2584a85-b2fb-4d86-a436-1a2b57b3d587', '9768b97e-eb73-49bd-8247-cc7c8a7c0a5d', 'd70c0eb2-3771-44f6-82ce-b86978708a47', 270.1),
('455f99f1-7644-4b14-8ce7-26d4726a125e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Back clear strong yeah cause fish boy owner.', '2025-02-04', 'eb04d115-d394-411d-81e9-48bada65c8e9', '71985b91-93e5-4eba-a192-18bcfd176f7b', 'dca22eb7-b5a0-4ed9-a5e9-7e89c9bad7c2', '71985b91-93e5-4eba-a192-18bcfd176f7b', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', 701.72),
('16246a17-7f52-40f0-940f-5a5a225e7f6e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Though here knowledge.', '2025-04-03', '48e09c77-f59c-4730-afde-db4f4080e372', '71f5bcaf-e4c0-4c52-a00d-098bd0dc9b68', 'dca22eb7-b5a0-4ed9-a5e9-7e89c9bad7c2', 'a37a3e3f-3e38-47c2-85ff-41e60804d95d', '61e67cc1-4342-4b47-abe9-49846c3285a7', 453.44),
('42eb0fc9-3495-4f73-84ea-2be37fac408c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Close live describe take ever its.', '2025-02-19', '67567550-5e11-4b66-af88-8f4dc5fe50c5', '0f64398e-664b-4988-85ae-e4bb5abf37d4', '457c182e-f7b7-43f0-9bc0-3b4a726a0e16', '7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', 518.14),
('65416a33-f081-4510-a95b-f0a600d0b449', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Stop order trial start detail second.', '2025-02-20', '3b385a7e-1c41-43b1-b835-dfe37a5b6bd3', '1c38a5bc-5ad3-455b-b5f4-c75d43bd8cf0', 'bd408e08-23fd-4e5d-8ed4-d959d1748fa6', '0f64398e-664b-4988-85ae-e4bb5abf37d4', '0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', 785.48),
('200ed267-41a7-4485-8349-19a8d0d5f647', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Peace conference produce seem.', '2025-01-11', 'eb04d115-d394-411d-81e9-48bada65c8e9', '065880ce-4976-4b68-87c1-cf5977814d10', '217abb92-b8ce-4528-b4a9-196a814c1d70', '71985b91-93e5-4eba-a192-18bcfd176f7b', 'faceb13e-484f-41a6-a6c4-40d8e6c6375f', 878.79),
('956cdd91-c09e-4ed0-8d6b-93843f9aa6e8', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Its light ten people already work develop.', '2025-06-04', '26ce6f3e-90ca-45da-8221-e47da141586e', '73f79725-b1e5-4e82-a1b8-0e0575e681b0', '962f4f6d-ec6b-4c45-8a1a-47f03f799aba', '59414c41-783a-4e1d-910f-de8ee4f5d1da', 'd70c0eb2-3771-44f6-82ce-b86978708a47', 287.63),
('161ba2e4-eedf-4a2b-bb00-fcd12461c35d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Local while in city.', '2025-05-08', '67567550-5e11-4b66-af88-8f4dc5fe50c5', 'cd36ca1b-e1ef-4074-af2c-4e0a18073575', '88db0300-c978-4e8a-ab28-0825e2a66ba5', 'ee2cc58b-54ce-4a5e-8fca-92e9ca4e199a', '2f95db51-02c4-4574-8411-fad0e7da695f', 923.89),
('e0b16660-0f78-46d5-a875-c14fe19d5354', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Ask put mouth success.', '2025-06-07', '171bcc24-11d8-4b82-9ee8-e893abc43e4e', 'ec6bd520-21b5-4ea5-a090-e87a6be02954', 'b2584a85-b2fb-4d86-a436-1a2b57b3d587', '1c38a5bc-5ad3-455b-b5f4-c75d43bd8cf0', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', 834.76),
('f853f836-44b9-4d87-926c-3dc5bb907dc3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Turn campaign safe interesting will you.', '2025-03-05', '67567550-5e11-4b66-af88-8f4dc5fe50c5', 'edb07a69-cd2a-49c0-88cd-3cdedbe543a3', '93db05a7-68ee-400c-a729-531b51da62a0', '71985b91-93e5-4eba-a192-18bcfd176f7b', '79c8961f-94bd-4081-bbe1-673af18a0c26', 102.65),
('d5bb1783-97e7-4165-a9c7-4a72153fb122', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Necessary short school dream protect he nature.', '2025-04-12', '2ed87926-6c74-474a-aa91-960acde071c0', '7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', '72a046c5-2c54-4cc5-82ef-9a741bc645b1', '0f64398e-664b-4988-85ae-e4bb5abf37d4', '34d44c61-ccc3-4af0-8851-8da713b0071d', 327.72),
('fd6b2570-2a1c-41f9-ba0f-75cc2412e935', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Design federal game level.', '2025-02-20', '48e09c77-f59c-4730-afde-db4f4080e372', '630a64fb-2f8f-4508-af0a-45ca4aee5866', 'b2584a85-b2fb-4d86-a436-1a2b57b3d587', '71985b91-93e5-4eba-a192-18bcfd176f7b', '2f95db51-02c4-4574-8411-fad0e7da695f', 739.35),
('35aad227-9a07-4eb9-997e-0b3a001157da', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Everyone long listen prove dinner.', '2025-02-04', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '73f79725-b1e5-4e82-a1b8-0e0575e681b0', '93db05a7-68ee-400c-a729-531b51da62a0', '10a5f062-fa2b-4dba-a533-40dc26e3527e', '7e556290-6f17-4638-887b-839e48791c23', 208.15),
('99873c6a-ca24-4e57-b473-704d1e41a38b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Be look happy.', '2025-05-25', 'a5f6551c-775a-45db-b4b8-e94b080c9e4e', '71f5bcaf-e4c0-4c52-a00d-098bd0dc9b68', '962f4f6d-ec6b-4c45-8a1a-47f03f799aba', '73f79725-b1e5-4e82-a1b8-0e0575e681b0', '7e556290-6f17-4638-887b-839e48791c23', 172.06),
('7d9a7baf-fe4a-427d-aa9d-28ed8cd5d257', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Stage realize affect major until.', '2025-02-12', '3b385a7e-1c41-43b1-b835-dfe37a5b6bd3', '59414c41-783a-4e1d-910f-de8ee4f5d1da', '72a046c5-2c54-4cc5-82ef-9a741bc645b1', 'a4fc8ef0-fff2-4c51-8a72-011090438fb3', '2f95db51-02c4-4574-8411-fad0e7da695f', 333.45),
('66d09191-1ae5-40ae-a2e2-9c86771a3319', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Several seek pull yeah.', '2025-04-15', '171bcc24-11d8-4b82-9ee8-e893abc43e4e', 'ec6bd520-21b5-4ea5-a090-e87a6be02954', '72a046c5-2c54-4cc5-82ef-9a741bc645b1', '7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', '2f95db51-02c4-4574-8411-fad0e7da695f', 583.25),
('3cbf7ff9-9b00-4375-b682-06794e62479b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Evidence never herself surface best use.', '2025-03-20', '48e09c77-f59c-4730-afde-db4f4080e372', 'af46e5e7-5061-4c0c-a202-ad86ec5f9c03', 'bd408e08-23fd-4e5d-8ed4-d959d1748fa6', 'ee2cc58b-54ce-4a5e-8fca-92e9ca4e199a', '2f95db51-02c4-4574-8411-fad0e7da695f', 640.06);

INSERT INTO recurrent_transaction (id, user_id, amount, description, transaction_id, start_date, period, end_date, duration, duration_type, recurrence_type, weekday) VALUES
('56a287a0-73f7-45b3-8ef7-78f66a6624ee', '5e967e16-0b2a-415c-8ac0-bf811452149a', 956.46, 'Produce plan new responsibility always movement decide government.', '3b385a7e-1c41-43b1-b835-dfe37a5b6bd3', '2025-04-09', 1, '2025-07-27', 4, 'day', 'daily', NULL),
('44beeaab-6a72-4c22-bf70-8e57362a093c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 196.84, 'Like already hour increase new travel focus.', '2ed87926-6c74-474a-aa91-960acde071c0', '2025-02-21', 1, '2025-09-22', 8, 'year', 'monthly', NULL),
('a540496d-9c05-4db8-8a00-0271371bd819', '5e967e16-0b2a-415c-8ac0-bf811452149a', 227.05, 'Teach really note body hospital appear whom.', '3b385a7e-1c41-43b1-b835-dfe37a5b6bd3', '2025-01-17', 1, '2025-09-26', 7, 'year', 'yearly', NULL),
('2ba2e31c-af68-4cb7-9cfd-fc9530411965', '5e967e16-0b2a-415c-8ac0-bf811452149a', 716.0, 'Environmental wish seven turn kitchen which two.', 'eb04d115-d394-411d-81e9-48bada65c8e9', '2025-05-20', 1, '2025-12-15', 11, 'year', 'weekly', 'Friday'),
('ef535c5d-3c06-402c-960c-50e2a76cb0fc', '5e967e16-0b2a-415c-8ac0-bf811452149a', 869.49, 'Artist themselves prove begin mouth.', 'eb04d115-d394-411d-81e9-48bada65c8e9', '2025-01-23', 1, '2025-11-28', 2, 'year', 'daily', NULL),
('3922ab9e-17d8-4b5f-82e1-5468de2fecf0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 785.17, 'Between pick generation board.', '7e556290-6f17-4638-887b-839e48791c23', '2025-03-17', 1, '2025-05-23', 10, 'year', 'weekly', 'Friday'),
('8e5089cb-65f7-4cb0-b593-e26a176bd3b8', '5e967e16-0b2a-415c-8ac0-bf811452149a', 861.65, 'Sense work all wish officer.', '7e556290-6f17-4638-887b-839e48791c23', '2025-04-09', 1, '2025-11-10', 3, 'month', 'monthly', NULL),
('e69a2b6f-e1cc-432f-8104-9dc52419829f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 93.58, 'Safe involve establish wrong board.', '67567550-5e11-4b66-af88-8f4dc5fe50c5', '2025-04-27', 1, '2025-08-10', 9, 'year', 'weekly', 'Sunday'),
('8b811e22-1c32-402d-9a92-8bbb6090cd42', '5e967e16-0b2a-415c-8ac0-bf811452149a', 503.54, 'Respond that commercial mission.', 'eb04d115-d394-411d-81e9-48bada65c8e9', '2025-01-05', 1, '2025-03-08', 4, 'month', 'yearly', NULL),
('e55fccfb-59e8-4115-9a17-f68f42e2b297', '5e967e16-0b2a-415c-8ac0-bf811452149a', 95.32, 'Bar station so political degree ahead rate.', 'faceb13e-484f-41a6-a6c4-40d8e6c6375f', '2025-05-26', 1, '2025-06-20', 1, 'day', 'weekly', 'Tuesday'),
('5c1e3101-08dd-40d8-ace3-4a63461d17e6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 459.73, 'Meet carry item recent performance information compare officer.', '67567550-5e11-4b66-af88-8f4dc5fe50c5', '2025-01-14', 1, '2025-07-07', 5, 'year', 'weekly', 'Wednesday'),
('7011081f-fc00-492e-bc88-fba5164c9626', '5e967e16-0b2a-415c-8ac0-bf811452149a', 770.56, 'Condition guess everyone house night.', 'a5f6551c-775a-45db-b4b8-e94b080c9e4e', '2025-01-29', 1, '2025-07-13', 11, 'day', 'monthly', NULL),
('e0fb75d9-7468-40a6-8bd8-1e992a35df03', '5e967e16-0b2a-415c-8ac0-bf811452149a', 637.32, 'Option beat officer prepare another past.', '65a5a7de-5658-4db8-8d3f-c31d04f1f1f7', '2025-06-02', 1, '2025-10-11', 2, 'year', 'monthly', NULL),
('ebd121a8-31f3-4caa-8761-457d0a98d714', '5e967e16-0b2a-415c-8ac0-bf811452149a', 425.63, 'Blue thousand fast group suddenly.', '2f95db51-02c4-4574-8411-fad0e7da695f', '2025-01-05', 1, '2025-11-06', 9, 'year', 'weekly', 'Friday'),
('ed4208db-4339-47ec-a5f7-68e7736ab99a', '5e967e16-0b2a-415c-8ac0-bf811452149a', 769.01, 'Left natural final.', '34d44c61-ccc3-4af0-8851-8da713b0071d', '2025-06-04', 1, '2025-06-24', 1, 'month', 'monthly', NULL),
('2f938d6b-4af6-4cb6-b2db-182f4acbb96d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 279.59, 'Forward case check enjoy we star my.', '48e09c77-f59c-4730-afde-db4f4080e372', '2025-05-23', 1, '2025-09-08', 7, 'month', 'daily', NULL),
('77dd66bf-7762-4927-99ef-9034dbee93ea', '5e967e16-0b2a-415c-8ac0-bf811452149a', 578.22, 'Section opportunity wonder treat should.', 'eb04d115-d394-411d-81e9-48bada65c8e9', '2025-05-12', 1, '2025-11-06', 3, 'year', 'weekly', 'Sunday'),
('4b3ab6d4-1591-48ac-9bb6-2f112293fec5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 511.46, 'Early discussion authority stop sport admit.', '67567550-5e11-4b66-af88-8f4dc5fe50c5', '2025-06-15', 1, '2025-09-27', 12, 'month', 'yearly', NULL),
('4f870c49-5785-40a2-8507-d2808ffd2ddd', '5e967e16-0b2a-415c-8ac0-bf811452149a', 188.23, 'The street remain include.', '7e556290-6f17-4638-887b-839e48791c23', '2025-03-07', 1, '2025-06-06', 5, 'day', 'weekly', 'Monday'),
('cc16e017-89f6-4796-bd6d-66d912884823', '5e967e16-0b2a-415c-8ac0-bf811452149a', 521.14, 'Character even attack.', 'ea5569db-da3d-42b9-a689-10d41515419d', '2025-02-25', 1, '2025-10-14', 3, 'month', 'yearly', NULL);

INSERT INTO chat_interactions (id, user_id, input_text, interpreted_action, response, response_type, linked_transaction_id, created_at) VALUES
('2e9966aa-b5b1-4dfd-a5f3-c4fba1708460', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Offer subject personal forget camera lead see.', 'create_transaction', 'Physical candidate wear spring reason hotel system charge.', 'summary', '79c8961f-94bd-4081-bbe1-673af18a0c26', '2025-06-23T11:56:03.731581+00:00'),
('f9c9984f-ed42-4c72-b6e6-380e713241f3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Clearly institution water number.', 'suggest_budget', 'North price range.', 'suggestion', '67567550-5e11-4b66-af88-8f4dc5fe50c5', '2025-06-23T11:56:03.731753+00:00'),
('c753ac2e-963a-4083-9f00-b167207c2f91', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Thousand perhaps expect decision chance result resource.', 'suggest_budget', 'Magazine back language notice federal stop career surface.', 'transaction', '79c8961f-94bd-4081-bbe1-673af18a0c26', '2025-06-23T11:56:03.731857+00:00'),
('c9a7da60-53d4-437d-9095-e2ac4f7dc25e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Environment discuss probably example quickly ahead term.', 'generate_summary', 'Know usually somebody rather.', 'transaction', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', '2025-06-23T11:56:03.731958+00:00'),
('8860a705-81f6-409c-94fc-4bd61521fd55', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Parent information president old structure.', 'suggest_budget', 'Each open something senior miss include.', 'summary', '34d44c61-ccc3-4af0-8851-8da713b0071d', '2025-06-23T11:56:03.732053+00:00'),
('093724a0-e4ef-40b8-9546-4f397e210499', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'History rule base day.', 'suggest_budget', 'Capital issue walk increase big there.', 'forecast', '0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', '2025-06-23T11:56:03.732143+00:00'),
('9a61968c-4546-48a7-8cda-ac249593004b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Building very miss his imagine.', 'suggest_budget', 'Your girl race lead likely this.', 'forecast', 'a5f6551c-775a-45db-b4b8-e94b080c9e4e', '2025-06-23T11:56:03.732234+00:00'),
('9e80900e-63c4-445c-a699-d6514906de44', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'People national old animal.', 'create_transaction', 'Whatever real sing mean provide general her.', 'transaction', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '2025-06-23T11:56:03.732333+00:00'),
('ed5e627c-a34f-4dcc-bfa9-8c6a67cc96ad', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Describe learn last activity.', 'get_forecast', 'Let your season environmental.', 'summary', '26ce6f3e-90ca-45da-8221-e47da141586e', '2025-06-23T11:56:03.732458+00:00'),
('ce541026-5c68-4e56-8253-88c35a55ff68', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Cultural far capital each actually Mrs after even.', 'create_transaction', 'Voice common down well try.', 'suggestion', '7e556290-6f17-4638-887b-839e48791c23', '2025-06-23T11:56:03.734090+00:00'),
('adce44b2-3047-4ad1-b567-0c6b6b6de60d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Serve arm finish carry true.', 'create_transaction', 'Live scene message news.', 'forecast', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', '2025-06-23T11:56:03.734207+00:00'),
('98cc0634-b6bd-4ed1-b408-43b5bb8de04b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Rate author reveal human want.', 'create_transaction', 'Financial offer school movement.', 'suggestion', 'd70c0eb2-3771-44f6-82ce-b86978708a47', '2025-06-23T11:56:03.734297+00:00'),
('f65decaa-b48c-475a-a0bd-80c340fd3608', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Certainly real clearly skin task sell Democrat.', 'get_forecast', 'Push particular student game.', 'transaction', '79c8961f-94bd-4081-bbe1-673af18a0c26', '2025-06-23T11:56:03.734374+00:00'),
('f8bb649a-d41f-402d-af76-f86b1015ecdd', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Several receive Mrs.', 'suggest_budget', 'Tax his nearly south break simply.', 'trend', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '2025-06-23T11:56:03.734450+00:00'),
('58a0306c-f01f-417a-b148-f2ef91deef3c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Couple human defense soldier my have wide.', 'get_forecast', 'Center small side particular police newspaper whom site.', 'transaction', '7e556290-6f17-4638-887b-839e48791c23', '2025-06-23T11:56:03.734526+00:00'),
('a730a4af-7654-46a6-b5b9-f6b5c7d47444', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Live consider run may relate sport free.', 'create_transaction', 'Word feel father page lay.', 'transaction', '0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', '2025-06-23T11:56:03.734601+00:00'),
('26f13cd5-7998-4398-8f6b-da2bf79df1d1', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Evidence consumer case car today strong.', 'create_transaction', 'Agreement page why have since.', 'suggestion', '0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', '2025-06-23T11:56:03.734673+00:00'),
('fc462b02-4b83-425f-995f-6a80fe5890d1', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Believe because factor heavy top social.', 'generate_summary', 'News yes science magazine upon mother example.', 'transaction', '7e556290-6f17-4638-887b-839e48791c23', '2025-06-23T11:56:03.734752+00:00'),
('e7602f0d-f6b4-4154-996a-e1981112b60b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Democrat tell never together.', 'create_transaction', 'Race let quickly close raise avoid.', 'trend', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '2025-06-23T11:56:03.734827+00:00'),
('ba79d032-d3e8-48af-a8eb-c82d14fad549', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Free newspaper strategy stay address.', 'suggest_budget', 'Walk social cut decade whom course question response.', 'trend', '0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', '2025-06-23T11:56:03.734905+00:00');

INSERT INTO uploads (id, user_id, file_name, file_type, storage_url, parsed_text, uploaded_at) VALUES
('0a5354a1-551c-43f9-bb08-e021645b4cd2', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'national.png', 'image/png', 'https://dummyimage.com/285x748', 'Science if fall above leader. Show deal amount third lot power seek. Foreign gun simply speech.
Painting affect security evidence government control down. Develop generation evening.', '2025-06-23T11:56:52.230528+00:00'),
('b91e7c09-9625-4f90-92da-eb0598f790e6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'pretty.png', 'image/png', 'https://placeimg.com/545/93/any', 'Maybe weight far toward. Model chance life event poor.
As first black student. Already material finish letter ask none meet service. Act laugh hundred development offer camera husband there.', '2025-06-23T11:56:52.230684+00:00'),
('0371c3b5-5f21-4fee-a0e8-de8d75e6254c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'treat.png', 'image/png', 'https://placeimg.com/766/130/any', 'Officer remain however political.
Seek everybody physical add do.
Always born pay people business Republican. Thousand hundred year foreign. Person officer can include.', '2025-06-23T11:56:52.230850+00:00'),
('5f9aa9f7-e939-446a-8f30-6fec52c8338a', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'down.png', 'image/png', 'https://dummyimage.com/890x469', 'Hot cover later share. Various reduce economy have right.
Doctor fly boy wait agree. Street military issue black. Set remember decision community.', '2025-06-23T11:56:52.245054+00:00'),
('b29c3ec7-8699-456a-a6e8-dc44b804d9af', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'amount.png', 'image/png', 'https://placekitten.com/173/765', 'Tell as cold material. Republican ready well especially. Product free government another look couple.', '2025-06-23T11:56:52.245306+00:00'),
('158da414-7145-4ed8-b583-b7605b2dbeee', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'question.png', 'image/png', 'https://www.lorempixel.com/159/816', 'Street add water. Also against there role enjoy side make book. Nice answer speech sure same Mrs draw scientist.', '2025-06-23T11:56:52.250213+00:00'),
('c2d4c90c-226d-4ef1-84d1-314555e5c9f9', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'serve.png', 'image/png', 'https://www.lorempixel.com/920/103', 'Dark improve personal population hour. Family design event.
Your exactly economic guess avoid. Sister meeting word apply suddenly.
Right ask first heavy however central treat opportunity.', '2025-06-23T11:56:52.250375+00:00'),
('3ef6cbc7-9df3-4919-a795-c57a190477c5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'themselves.png', 'image/png', 'https://www.lorempixel.com/979/757', 'Good phone professor seat form western my. Need budget product dream determine leave option. Religious watch these sing scientist power.', '2025-06-23T11:56:52.250618+00:00'),
('f9fdc668-162d-41ec-826f-29296a187b3b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'pick.png', 'image/png', 'https://placeimg.com/683/70/any', 'Ask side ever particular party low thank. High all Congress money team. Hope prove mean perhaps late because meet happen.', '2025-06-23T11:56:52.250725+00:00'),
('a1c69e43-0b56-4650-b2ed-f38f56539b71', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'drop.png', 'image/png', 'https://dummyimage.com/396x93', 'Economy we customer catch help. Something front young responsibility radio before several. Others us defense lot movie decision.', '2025-06-23T11:56:52.251057+00:00'),
('a4642480-38c1-451c-9777-f59406758e80', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'wide.png', 'image/png', 'https://www.lorempixel.com/1007/537', 'Yard ahead Democrat. Nothing should image difficult team what treatment.
Organization energy far appear position billion provide. Be piece authority population side series.', '2025-06-23T11:56:52.253241+00:00'),
('8b968600-1189-42e9-9431-2e2f27d2d0e4', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'discussion.png', 'image/png', 'https://placekitten.com/6/631', 'Time artist newspaper thought might others. Dinner record carry pick natural radio chair. Challenge mind nearly staff idea edge exactly.', '2025-06-23T11:56:52.257204+00:00'),
('884f8884-a141-42be-9c65-d39aec66ac7a', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'author.png', 'image/png', 'https://placekitten.com/210/852', 'Pm in seem beautiful follow. Give major this box along seek.
Learn decision agreement develop traditional news. How eat class check.
Now show its arm. Last economic best foot weight poor season.', '2025-06-23T11:56:52.260920+00:00'),
('e3ee624c-c16b-4564-bdc7-d0b0ab8cf538', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'him.png', 'image/png', 'https://placekitten.com/38/243', 'Another hotel sea series expect third attorney. Yeah president their raise image watch over. Describe charge common beautiful line thank instead.', '2025-06-23T11:56:52.261051+00:00'),
('75c03cde-b66d-41fc-bec0-25f3b8efb811', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'message.png', 'image/png', 'https://placeimg.com/732/728/any', 'Open environmental space own in them herself. To ability red.', '2025-06-23T11:56:52.261156+00:00'),
('89e89331-2dae-43e7-9b8a-120dd7e1c867', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'service.png', 'image/png', 'https://dummyimage.com/632x18', 'Always movie put feel adult blood. Author involve this edge early. Admit center offer history. Do next style night above about magazine.', '2025-06-23T11:56:52.261314+00:00'),
('ae2471c6-1005-4cfb-94e4-9303bfe69208', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'career.png', 'image/png', 'https://dummyimage.com/152x982', 'Open consider share idea analysis. Part since marriage standard.
Conference page probably. Visit bring important thousand enter.', '2025-06-23T11:56:52.261452+00:00'),
('d6603c13-db24-4123-a62e-0b009e8d9fce', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'democratic.png', 'image/png', 'https://dummyimage.com/888x765', 'Time thus available example instead appear. One focus seek share fact there. Office let public exist discover like.
Production develop community cost.', '2025-06-23T11:56:52.261710+00:00'),
('e30c5338-26f1-4ad7-bd76-38e7353bec43', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'room.png', 'image/png', 'https://placekitten.com/1020/415', 'Ability suggest indeed indeed economic. Animal later that morning learn listen kind.
Traditional check describe just create wear. Into east south no onto situation improve character.', '2025-06-23T11:56:52.265307+00:00'),
('817b8c5a-2989-4dcd-bf78-35a64d40fc24', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'others.png', 'image/png', 'https://www.lorempixel.com/691/662', 'Property land customer behavior mother certainly Mrs. Stand unit moment card not. Present room require against field.', '2025-06-23T11:56:52.268940+00:00');

INSERT INTO ai_extractions (id, user_id, linked_transaction_id, upload_id, source, interpreted_type, category_suggestion, amount, extraction_method, confidence_score, created_at) VALUES
('3016de2f-84ee-4a1a-8dbe-e15c4b19b22c', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2f95db51-02c4-4574-8411-fad0e7da695f', 'f9fdc668-162d-41ec-826f-29296a187b3b', 'High make radio glass. Personal he your race though others behind.
Whole college four appear realize. May head keep minute expect.', 'expense', 'Serve', 346.26, 'ocr', 0.81, '2025-06-23T12:00:52.253708+00:00'),
('692fc539-ef55-4386-bc32-9f0e8e4b5b64', '5e967e16-0b2a-415c-8ac0-bf811452149a', '34d44c61-ccc3-4af0-8851-8da713b0071d', '0a5354a1-551c-43f9-bb08-e021645b4cd2', 'South condition charge store break computer. Lay throw a somebody.
Congress training month threat. Effort response night enough.', 'income', 'Something', 130.38, 'ocr', 0.74, '2025-06-23T12:00:52.254137+00:00'),
('1a9ddc92-a25e-489e-8d76-4e92e647882d', '5e967e16-0b2a-415c-8ac0-bf811452149a', '65a5a7de-5658-4db8-8d3f-c31d04f1f1f7', '89e89331-2dae-43e7-9b8a-120dd7e1c867', 'Only nearly share. History become hear radio leave cultural. System small only.', 'debt', 'Begin', 35.1, 'ocr', 0.8, '2025-06-23T12:00:52.262140+00:00'),
('6f381d43-979b-4e21-88ed-a05153d7c677', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2f95db51-02c4-4574-8411-fad0e7da695f', 'a1c69e43-0b56-4650-b2ed-f38f56539b71', 'Reveal gun section scene company name finish. View person tell deal idea second. Certain offer miss church recent.', 'saving', 'Man', 472.66, 'chat', 0.8, '2025-06-23T12:00:52.269116+00:00'),
('5c7047c0-f09a-4ec3-ac9c-1b397c99e988', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', 'b29c3ec7-8699-456a-a6e8-dc44b804d9af', 'Civil you almost recognize. Painting total pick.
At hour majority back final truth. Health various foot second.', 'saving', 'Where', 817.93, 'ocr', 0.91, '2025-06-23T12:00:52.272639+00:00'),
('7d4d8ca3-cb1d-440e-bd71-9c43547f1224', '5e967e16-0b2a-415c-8ac0-bf811452149a', '79c8961f-94bd-4081-bbe1-673af18a0c26', 'e30c5338-26f1-4ad7-bd76-38e7353bec43', 'Major threat another themselves never blue else vote. Current position far them hour.', 'income', 'Head', 277.53, 'ocr', 0.81, '2025-06-23T12:00:52.273089+00:00'),
('8a3980f8-8053-45ce-8cfe-60bc7379f07b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'faceb13e-484f-41a6-a6c4-40d8e6c6375f', '0a5354a1-551c-43f9-bb08-e021645b4cd2', 'Everybody us skill sister. Kind marriage real whole minute road TV worry.', 'debt', 'Outside', 530.59, 'chat', 0.88, '2025-06-23T12:00:52.273429+00:00'),
('1d203e74-2486-475b-b13b-a09544941566', '5e967e16-0b2a-415c-8ac0-bf811452149a', '34d44c61-ccc3-4af0-8851-8da713b0071d', 'a4642480-38c1-451c-9777-f59406758e80', 'Realize live special account approach face hotel clear. Speech every specific.
Marriage wrong kind unit. Approach four season would start clear.', 'debt', 'Fire', 605.11, 'chat', 0.89, '2025-06-23T12:00:52.273600+00:00'),
('417f9b2f-4626-419e-93f3-2ff4625639a3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'eb04d115-d394-411d-81e9-48bada65c8e9', 'd6603c13-db24-4123-a62e-0b009e8d9fce', 'Story song animal right blood us threat door. Himself anything between summer buy help boy.', 'income', 'Consider', 634.82, 'chat', 0.99, '2025-06-23T12:00:52.274516+00:00'),
('b6db3e9e-111d-47ef-8903-27cd253d50a4', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2ed87926-6c74-474a-aa91-960acde071c0', 'b91e7c09-9625-4f90-92da-eb0598f790e6', 'Rate I air treat. Second modern message.
Morning Mr day. Note never year black kid senior. Space people new light do front.', 'budget', 'Matter', 479.59, 'ocr', 0.75, '2025-06-23T12:00:52.275809+00:00'),
('d354f5a3-ccfb-4bcc-9689-28f668771d07', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'eb04d115-d394-411d-81e9-48bada65c8e9', '158da414-7145-4ed8-b583-b7605b2dbeee', 'Strategy turn democratic sit moment husband. Reality store stuff. Late effort training foreign economic.', 'saving', 'View', 221.07, 'ocr', 0.76, '2025-06-23T12:00:52.281129+00:00'),
('726f0220-b713-47ae-bf94-935878940cf4', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'ea5569db-da3d-42b9-a689-10d41515419d', 'ae2471c6-1005-4cfb-94e4-9303bfe69208', 'Computer film husband science do. Occur player that want week.
Think kid bed reveal hand.', 'expense', 'Might', 403.01, 'chat', 0.72, '2025-06-23T12:00:52.281570+00:00'),
('dd6dfbec-93b4-49d5-9cf1-27b133a270b5', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '89e89331-2dae-43e7-9b8a-120dd7e1c867', 'Try west trouble back general southern. Investment yet thought into. Opportunity author Democrat middle eye.', 'expense', 'Well', 453.47, 'ocr', 0.91, '2025-06-23T12:00:52.281990+00:00'),
('65d14182-3858-42dd-8cc9-18e6f329d6c4', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '5f9aa9f7-e939-446a-8f30-6fec52c8338a', 'Possible away yes past. Manager room up service leg positive main. Source local able culture race.', 'income', 'Work', 539.48, 'chat', 0.85, '2025-06-23T12:00:52.282312+00:00'),
('c615d36c-728f-4a19-a719-ddcbd773acb4', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2ed87926-6c74-474a-aa91-960acde071c0', 'b29c3ec7-8699-456a-a6e8-dc44b804d9af', 'A rather every possible. Enough edge event compare or ahead.
Return prepare push understand. Pick wife he. Brother various drug pressure.', 'saving', 'Staff', 47.96, 'ocr', 0.89, '2025-06-23T12:00:52.284878+00:00'),
('ecc555d0-080b-4985-b73f-cbea27cdf989', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2f95db51-02c4-4574-8411-fad0e7da695f', '884f8884-a141-42be-9c65-d39aec66ac7a', 'Discussion who sound number task according development.', 'expense', 'Training', 576.52, 'ocr', 0.77, '2025-06-23T12:00:52.285025+00:00'),
('7bdb4f11-f463-4f86-868c-8061c90cad46', '5e967e16-0b2a-415c-8ac0-bf811452149a', '171bcc24-11d8-4b82-9ee8-e893abc43e4e', '89e89331-2dae-43e7-9b8a-120dd7e1c867', 'Body travel special eight magazine machine risk. Use finish enter ten focus big. Writer thus care kind.', 'budget', 'Realize', 753.4, 'chat', 0.84, '2025-06-23T12:00:52.285167+00:00'),
('88023665-216b-418d-a466-3b4780485972', '5e967e16-0b2a-415c-8ac0-bf811452149a', '67567550-5e11-4b66-af88-8f4dc5fe50c5', '0371c3b5-5f21-4fee-a0e8-de8d75e6254c', 'Thought others force. Government wonder start role seven senior.
Ball walk among book no baby. Enter write seem some.', 'debt', 'Cost', 184.07, 'ocr', 0.78, '2025-06-23T12:00:52.285315+00:00'),
('2901b6a3-4510-4c0a-a2dd-7d0ed5487eb6', '5e967e16-0b2a-415c-8ac0-bf811452149a', '679d38f0-6ebf-4b4d-9748-63bdf4c72402', '0a5354a1-551c-43f9-bb08-e021645b4cd2', 'Sound western method instead. Success among official knowledge. Operation those easy president late.', 'budget', 'Where', 258.76, 'chat', 0.79, '2025-06-23T12:00:52.285461+00:00'),
('7b7fa90c-c36f-4ab0-8de5-82343560ea86', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2ed87926-6c74-474a-aa91-960acde071c0', '89e89331-2dae-43e7-9b8a-120dd7e1c867', 'Water soon hope early of weight seat. Hand down interview ability top cause agree.', 'income', 'True', 343.4, 'chat', 0.7, '2025-06-23T12:00:52.285600+00:00');



