FROM ubuntu:18.04

WORKDIR /package

RUN mkdir -p /package
RUN mkdir -p /package

# Installing dependencies
RUN apt update
RUN apt-get update
RUN apt-get install -y locate libopenjp2-7 poppler-utils curl zip python3.8 python3.8-dev python3.8-distutils python3.8-venv 

RUN updatedb
RUN rm -rf /package/poppler_binaries;  mkdir /package/poppler_binaries;
RUN cp $(which pdftoppm) /package/poppler_binaries/.
RUN cp $(which pdfinfo) /package/poppler_binaries/.
RUN cp $(which pdftocairo) /package/poppler_binaries/.
RUN cp $(locate libpoppler.so) /package/poppler_binaries/.
RUN cp $(locate libjpeg.so.8) /package/poppler_binaries/.
RUN cp $(locate libopenjp2.so.7) /package/poppler_binaries/.
RUN cp $(locate libpng16.so.16) /package/poppler_binaries/.
RUN cp $(locate libz.so.1) /package/poppler_binaries/.
RUN cp $(locate libfreetype.so.6) /package/poppler_binaries/.
RUN cp $(locate libfontconfig.so.1) /package/poppler_binaries/.
RUN cp $(locate libnss3.so) /package/poppler_binaries/.
RUN cp $(locate libsmime3.so) /package/poppler_binaries/.
RUN cp $(locate liblcms2.so.2) /package/poppler_binaries/.
RUN cp $(locate libtiff.so.5) /package/poppler_binaries/.
RUN cp $(locate libexpat.so.1) /package/poppler_binaries/.
RUN cp $(locate libjbig.so.0) /package/poppler_binaries/.

# Python PIP
RUN curl -O https://bootstrap.pypa.io/get-pip.py
RUN python3.8 get-pip.py

# Copy files
COPY requirements.txt ../.

# Pip install
RUN pip install -r ../requirements.txt --target /package

COPY ./lambda/index.py /package

# packaging
RUN cd /package/; rm ../package.zip; echo "deleting zip if exists"
RUN cd /package/; zip -r9 ../package.zip .