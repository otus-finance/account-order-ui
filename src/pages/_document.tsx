import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" />
					<link
						href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&display=swap"
						rel="stylesheet"
					/>
				</Head>
				<body className=" bg-gradient-to-l from-zinc-100 to-white  dark:from-black dark:to-zinc-900 font-sans h-full">
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
