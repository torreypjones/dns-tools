# dns-tools

This is a simple tool to help with DNS management. It allows you to check the records for a domain, and compare different name servers. It was created to assist with the migration of domains from one registrar to another.

Generally speaking, when migrating domains from one registrar to another, you want to make sure that the DNS records are correctly transferred. I could not find any free tools to do this, so I made my own. I was stuck digging through existing records, looking for the ones that were not present in the new registrar.

Migration of a domain typically happens using the following process:

1. Domain owner to provide the WHOIS information for us to have on record with new registries
2. On losing Registrar remove DNSSEC from domain
3. Provide AXFR files to be rebuilt at new registrar. I found that not all registrars provide this ability, and you're stuck finding this info yourself. \<cough\>godaddy\<\/cough\>. Only after I created this did I find that Google Cloud DNS using `gcloud dns record-sets export`. 

4. Update Nameservers at losing registrar to new registrar after zones are built. Before you do this, you want to compare old name servers to new name servers. This is where this tool comes in. 
5. Have losing registrar unlock domains and provide auth codes
6. New registrar transfers domains
7. New registrar locks the super most valuable domains at the registry - instructions to follow in separate email
8. New registrar can resign DNSSEC




<br>
<br>
<br>
<br>
<br>
<br>



# stock nextjs project info below




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
