import { Config } from '@remotion/cli/config';
import path from 'path';

Config.overrideWebpackConfig((currentConfiguration) => {
    return {
        ...currentConfiguration,
        module: {
            ...currentConfiguration.module,
            rules: [
                ...(currentConfiguration.module?.rules ?? []).filter((r: any) => {
                    // Filter out existing CSS rules to prevent conflicts
                    if (r && r.test && r.test.toString().includes("css")) {
                        return false;
                    }
                    return true;
                }),
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: "style-loader",
                        },
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    config: path.resolve(process.cwd(), "postcss.config.cjs"),
                                },
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            ...currentConfiguration.resolve,
            alias: {
                ...currentConfiguration.resolve?.alias,
                "@": path.join(process.cwd(), "src"),
            },
        },
    };
});

Config.setChromiumDisableWebSecurity(true);
